# Vilaasa Estates — Docker Deployment (Hostinger VPS + Apache)

Target: **https://www.vilaasaestates.com**

## Architecture

```
Internet
  └─ Apache (host :80/:443, Let's Encrypt TLS)
       └─ 127.0.0.1:8080  ──► web container (nginx)
                                ├─ /            → React SPA (static, baked into image)
                                └─ /api/v1/*    → backend container :5000
                                                    └─ postgres container :5432
                                                         └─ named volume: vilaasa-db
```

Only the `web` container is published, and only on loopback. Postgres and the
API are never reachable from the internet. Because the SPA calls `/api/v1` on
its own origin, CORS is not exercised in normal browsing.

---

## 1. Prepare the VPS

```bash
ssh root@<your-vps-ip>

# Docker Engine + compose plugin
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version

# Apache modules used by the reverse proxy
sudo a2enmod proxy proxy_http headers rewrite ssl
sudo systemctl restart apache2
```

## 2. Point DNS at the VPS

In your DNS provider, both records must resolve to the VPS IP:

| Type | Name  | Value          |
| :--- | :---- | :------------- |
| A    | `@`   | `<your-vps-ip>` |
| A    | `www` | `<your-vps-ip>` |

Confirm before continuing — certbot fails if DNS has not propagated:

```bash
dig +short www.vilaasaestates.com
```

## 3. Get the code onto the VPS

```bash
sudo mkdir -p /opt/vilaasa && sudo chown $USER:$USER /opt/vilaasa
git clone https://github.com/eyeleveltech/Vilaasa-Estate.git /opt/vilaasa
cd /opt/vilaasa
```

## 4. Install the environment file

`.env.production` is gitignored and holds every credential, so it is copied
separately. From your **local machine**:

```bash
scp .env.production root@<your-vps-ip>:/opt/vilaasa/.env.production
```

Then lock it down on the VPS:

```bash
chmod 600 /opt/vilaasa/.env.production
```

## 5. Build and start

```bash
cd /opt/vilaasa
docker compose build
docker compose up -d
docker compose ps
```

The backend entrypoint runs `prisma migrate deploy` on every boot. Migrations
are additive, so this is safe to repeat. **The seed never runs** — see §8.

Verify the stack from the VPS itself before involving Apache:

```bash
curl -s http://127.0.0.1:8080/api/v1/health
# {"success":true,...,"data":{"status":"healthy",...}}

curl -sI http://127.0.0.1:8080/ | head -1
# HTTP/1.1 200 OK
```

## 6. Apache reverse proxy + TLS

```bash
sudo cp /opt/vilaasa/deploy/vilaasaestates.com.conf /etc/apache2/sites-available/
sudo a2ensite vilaasaestates.com

# If Hostinger pre-created a default vhost that grabs port 80, disable it:
sudo a2dissite 000-default

sudo apache2ctl configtest && sudo systemctl reload apache2
```

Then issue the certificate. Certbot reads the vhost and generates the matching
`:443` vhost, carrying the proxy directives across:

```bash
sudo apt install -y certbot python3-certbot-apache
sudo certbot --apache -d vilaasaestates.com -d www.vilaasaestates.com
```

**After certbot runs**, open the generated
`/etc/apache2/sites-available/vilaasaestates.com-le-ssl.conf` and confirm it
contains:

```apache
RequestHeader set X-Forwarded-Proto "https"
```

Certbot copies the `http` value from the source vhost. If it is left as
`"http"`, the API will believe requests are insecure. Fix it, then:

```bash
sudo apache2ctl configtest && sudo systemctl reload apache2
```

Renewal is installed automatically; confirm with `sudo certbot renew --dry-run`.

## 7. Verify the live site

```bash
curl -s https://www.vilaasaestates.com/api/v1/health
curl -sI https://vilaasaestates.com/           # should 301 to www
curl -sI https://www.vilaasaestates.com/admin/login | head -1   # 200, SPA fallback
```

## 8. Create the first admin account

The database starts empty. `prisma/seed.ts` is **excluded from the production
image on purpose** — it deletes every row in all 24 tables. Create the admin
with the dedicated single-row script instead:

```bash
cd /opt/vilaasa
docker compose exec \
  -e ADMIN_LOGIN_EMAIL=admin@vilaasaestates.com \
  -e ADMIN_LOGIN_PASSWORD='<a-strong-password-min-12-chars>' \
  backend node scripts/create-admin.js
```

Re-running it resets that account's password rather than failing.

Sign in at `https://www.vilaasaestates.com/admin/login`.

---

## Routine operations

**Deploy a new version**

```bash
cd /opt/vilaasa
git pull
docker compose build
docker compose up -d
```

**Logs**

```bash
docker compose logs -f backend
docker compose logs -f web
docker compose logs --tail=100 postgres
```

**Database backup** (nothing does this for you — a container volume is not a backup)

```bash
docker compose exec -T postgres pg_dump -U postgres vilaasa \
  | gzip > ~/vilaasa-$(date +%F).sql.gz
```

Restore:

```bash
gunzip -c ~/vilaasa-2026-01-01.sql.gz \
  | docker compose exec -T postgres psql -U postgres -d vilaasa
```

Worth adding to cron:

```cron
0 3 * * * cd /opt/vilaasa && docker compose exec -T postgres pg_dump -U postgres vilaasa | gzip > /root/backups/vilaasa-$(date +\%F).sql.gz
```

**Restart / stop**

```bash
docker compose restart backend
docker compose down          # stops containers, KEEPS the data volume
docker compose down -v       # DESTROYS the database volume. Do not run casually.
```

---

## Troubleshooting

| Symptom | Cause | Fix |
| :--- | :--- | :--- |
| `502` from Apache | web container down, or `a2enmod proxy_http` missing | `docker compose ps`, then `sudo a2enmod proxy_http && systemctl restart apache2` |
| Site loads, API calls fail | Apache vhost not proxying `/api/` | The vhost proxies `/` wholesale — check you did not add a competing `DocumentRoot` |
| Backend restart loop | Bad `DATABASE_URL`, or a missing required env var | `docker compose logs backend` — env errors are printed as one list at boot |
| `exec format error` on entrypoint | `docker-entrypoint.sh` saved with CRLF | `.gitattributes` forces LF; re-clone, or run `dos2unix backend/docker-entrypoint.sh` |
| Uploads fail near 100 MB | proxy body limit | `client_max_body_size` (nginx) and `ProxyTimeout` (Apache) are already set to match multer's 100 MB |
| Emails link to `localhost` | `FRONTEND_URL` not set | Must be `https://www.vilaasaestates.com` in `.env.production` |
| Everyone shares one rate limit | `X-Forwarded-For` chain broken | nginx passes the header through unchanged to match Express's `trust proxy = 1`; do not change it to `$proxy_add_x_forwarded_for` without also raising the trust level |
