FROM node:22.16.0-alpine3.22 AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
# All deps stage
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
# 使用 --frozen-lockfile 确保安装与锁定文件完全一致
RUN pnpm install --frozen-lockfile

# Production only deps stage
FROM base AS production-deps
WORKDIR /app
ADD package.json package-lock.json ./
RUN npm ci --omit=dev

# Build stage
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN node ace build

# Production stage
FROM base
ENV NODE_ENV=production
WORKDIR /app
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build /app
EXPOSE 3000
CMD ["node", "./bin/server.js"]
