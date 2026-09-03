# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1 — build the Vite bundle
# ---------------------------------------------------------------------------
FROM node:20-bookworm-slim AS build

WORKDIR /app

# devDependencies are required: vite.config.ts imports lovable-tagger at the
# top level, so an --omit=dev install cannot even load the config.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# The repository's committed .env points VITE_API_URL at localhost:5000, which
# would be baked into the bundle and break the deployed site. Production config
# arrives via the build argument below instead.
RUN rm -f .env .env.local .env.development .env.production.local

# Relative by default so the SPA calls the API on its own origin, which removes
# CORS from the picture entirely.
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2 — serve the bundle and proxy the API
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
