# syntax=docker/dockerfile:1.7

# ---- build ---------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true

COPY . .
RUN pnpm build

# ---- runtime -------------------------------------------------------------
FROM node:22-alpine AS runtime
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --config.dangerouslyAllowAllBuilds=true

COPY --from=build /app/dist ./dist

EXPOSE 5000
CMD ["node", "dist/main.js"]
