# --- 阶段 1: 基础环境 ---
FROM node:22.16.0-alpine3.22 AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# --- 阶段 2: 安装所有依赖 (用于 Build) ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- 阶段 3: 仅安装生产环境依赖 ---
FROM base AS production-deps
COPY package.json pnpm-lock.yaml ./
# 修正点：使用 pnpm 只安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# --- 阶段 4: 编译阶段 ---
FROM base AS build
COPY --from=deps /app/node_modules /app/node_modules
ADD . .
RUN node ace build

# --- 阶段 5: 最终运行阶段 ---
FROM node:22.16.0-alpine3.22
ENV NODE_ENV=production
WORKDIR /app
# 从阶段 3 拷贝生产依赖
COPY --from=production-deps /app/node_modules /app/node_modules
# 从阶段 4 拷贝编译后的产物
COPY --from=build /app/build /app
EXPOSE 3000

# 修正点：AdonisJS 编译后的入口路径
CMD ["node", "bin/server.js"]
