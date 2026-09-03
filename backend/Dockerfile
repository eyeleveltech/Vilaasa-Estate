# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 — install dependencies, generate the Prisma client, compile TypeScript
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS build

# Prisma's query engine links against OpenSSL both when generating and at runtime.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependency layer is cached until package.json / package-lock.json change.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 — runtime
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS runtime

RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
WORKDIR /app

# node_modules is carried over whole because it holds two things the container
# needs at run time: the generated Prisma client, and the Prisma CLI that the
# entrypoint uses for `migrate deploy`.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY scripts ./scripts
COPY package.json ./
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER node
EXPOSE 5000

# Uses Node's built-in fetch rather than adding curl to the image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:5000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/app.js"]
