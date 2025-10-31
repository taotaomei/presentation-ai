# 🔧 Docker 构建问题修复说明

## 问题描述

在 Docker 构建过程中遇到以下错误：

```
Error: Could not find Prisma Schema that is required for this command.
You can either provide it with `--schema` argument,
set it in your Prisma Config file (e.g., `prisma.config.ts`),
set it as `prisma.schema` in your package.json,
or put it into the default location (`./prisma/schema.prisma`, or `./schema.prisma`.
```

## 问题原因

在 Dockerfile 的 deps 阶段（第一阶段）：

1. 只复制了 `package.json` 和 `pnpm-lock.yaml`
2. 运行 `pnpm install --frozen-lockfile` 
3. package.json 中配置了 postinstall 脚本：`"postinstall": "prisma generate"`
4. 但此时 `prisma/schema.prisma` 文件还没有被复制到容器中
5. 导致 `prisma generate` 失败

## 解决方案

在 deps 阶段复制 prisma 目录：

```dockerfile
# Stage 1: 依赖安装
FROM node:20-alpine AS deps

# 安装 pnpm
RUN corepack enable && corepack prepare pnpm@10.17.0 --activate

# 设置工作目录
WORKDIR /app

# 复制 package 文件和 prisma schema
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/  # ← 添加这一行

# 安装依赖
RUN pnpm install --frozen-lockfile
```

## 修复验证

修复后的构建流程：

1. ✅ 复制 package.json、pnpm-lock.yaml 和 prisma 目录
2. ✅ 运行 `pnpm install`，自动触发 postinstall
3. ✅ postinstall 运行 `prisma generate`，成功找到 schema.prisma
4. ✅ 生成 Prisma Client
5. ✅ 继续后续构建步骤

## 相关文件

- `Dockerfile` - 已修复
- `package.json` - 包含 postinstall 脚本
- `prisma/schema.prisma` - Prisma 数据库架构文件

## 注意事项

1. **prisma 目录必须存在** - 确保项目中有 `prisma/schema.prisma` 文件
2. **.dockerignore 不能排除 prisma** - 确保 .dockerignore 中没有忽略 prisma 目录
3. **postinstall 脚本** - 这是 Next.js + Prisma 项目的标准配置

## 测试构建

修复后，可以使用以下命令测试构建：

```bash
# 方式 1: 使用 docker-compose
docker-compose build

# 方式 2: 使用 deploy.sh 脚本
./deploy.sh build

# 方式 3: 直接使用 docker
docker build -t presentation-ai .
```

## 预期结果

构建应该能够成功完成，输出类似：

```
#12 102.8 > presentation@0.1.0 postinstall /app
#12 102.8 > prisma generate
#12 104.3 ✔ Generated Prisma Client to ./node_modules/@prisma/client
#12 104.3 
#12 104.5 Done in 102.5s
```

## 相关资源

- [Prisma Schema 位置文档](https://pris.ly/d/prisma-schema-location)
- [Next.js Docker 部署](https://nextjs.org/docs/deployment#docker-image)
- [多阶段构建最佳实践](https://docs.docker.com/build/building/multi-stage/)

---

**修复完成** ✅

现在 Docker 构建应该能够正常工作了。
