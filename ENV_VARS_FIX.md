# 🔧 环境变量构建问题修复

## 问题症状

构建 Docker 镜像时出现以下错误：

```
❌ Invalid environment variables: {
  DATABASE_URL: [ 'Required' ],
  TAVILY_API_KEY: [ 'Required' ],
  OPENAI_API_KEY: [ 'Required' ],
  TOGETHER_AI_API_KEY: [ 'Required' ],
  GOOGLE_CLIENT_ID: [ 'Required' ],
  GOOGLE_CLIENT_SECRET: [ 'Required' ],
  UNSPLASH_ACCESS_KEY: [ 'Required' ],
  NEXTAUTH_URL: [ 'Required' ],
  NEXTAUTH_SECRET: [ 'Required' ]
}
Error: Invalid environment variables
```

## 根本原因分析

### 1. 构建流程问题

```
Docker 构建过程
    ↓
Next.js build 命令运行
    ↓
加载 next.config.js
    ↓
执行 await import("./src/env.js")  ← 这里验证环境变量
    ↓
env.js 检查所有必需的环境变量
    ↓
找不到环境变量 → 构建失败
```

### 2. 为什么找不到环境变量？

1. **本地 .env 文件被排除**
   - `.dockerignore` 中排除了 `.env` 文件
   - 这是正确的安全做法（不应将敏感信息打包到镜像中）

2. **docker-compose 的环境变量不在构建时注入**
   - `docker-compose.yml` 中的 `environment` 只在**运行时**有效
   - 构建时（`docker build`）无法访问这些变量

3. **src/env.js 的验证机制**
   - 使用 `@t3-oss/env-nextjs` 进行环境变量验证
   - 在 `next.config.js` 加载时就会执行验证
   - 构建时就需要这些变量

## 解决方案

### 方案说明

在 Dockerfile 的 builder 阶段设置**虚拟环境变量**：

```dockerfile
# Stage 2: 构建应用
FROM node:20-alpine AS builder

# 设置构建时的虚拟环境变量
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"
ENV NEXTAUTH_SECRET="build-time-secret"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV GOOGLE_CLIENT_ID="build-client-id"
ENV GOOGLE_CLIENT_SECRET="build-client-secret"
ENV OPENAI_API_KEY="sk-build-key"
ENV TOGETHER_AI_API_KEY="build-key"
ENV TAVILY_API_KEY="build-key"
ENV UNSPLASH_ACCESS_KEY="build-key"
ENV UPLOADTHING_TOKEN="build-token"

# 构建应用
RUN pnpm build
```

### 为什么这样做？

✅ **安全性**
- 虚拟值不包含任何敏感信息
- 真实值在运行时通过 docker-compose 注入
- 镜像中不包含真实密钥

✅ **构建成功**
- 满足 env.js 的验证要求
- 允许 Next.js 成功构建

✅ **运行时覆盖**
- docker-compose.yml 中的真实环境变量会覆盖这些虚拟值
- 应用运行时使用的是真实配置

## 工作原理

### 构建时（Build Time）

```dockerfile
# Dockerfile 中的 ENV 指令
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"
    ↓
Next.js 构建过程
    ↓
env.js 验证 ✓ 通过（因为变量存在）
    ↓
构建成功，生成 .next 目录
```

### 运行时（Runtime）

```yaml
# docker-compose.yml
environment:
  DATABASE_URL: "${DATABASE_URL}"  ← 从 .env 文件读取真实值
    ↓
容器启动，环境变量注入
    ↓
覆盖 Dockerfile 中的虚拟值
    ↓
应用使用真实的数据库连接
```

## 环境变量优先级

Docker 环境变量的优先级（从高到低）：

1. **docker run -e** 命令行参数
2. **docker-compose.yml environment** 配置
3. **Dockerfile ENV** 指令（我们的虚拟值）
4. 操作系统环境变量

因此，docker-compose.yml 中的配置会覆盖 Dockerfile 中的虚拟值。

## 验证修复

### 1. 构建应该成功

```bash
./deploy.sh build
# 或
docker-compose build
```

预期输出：
```
✓ Compiled successfully
Creating docker image...
```

### 2. 运行时使用真实配置

```bash
# 启动容器
./deploy.sh start

# 检查环境变量
docker-compose exec app env | grep DATABASE_URL

# 应该显示 .env 文件中的真实值
# 例如: DATABASE_URL=postgresql://presentation:presentation_password@postgres:5432/presentation_db
```

## 常见问题

### Q: 这些虚拟值安全吗？

A: 完全安全。这些是假值，不包含任何敏感信息。真实的密钥只存在于你的 `.env` 文件中，不会被打包到镜像里。

### Q: 为什么不直接跳过 env.js 的验证？

A: env.js 的验证是重要的安全特性，可以确保运行时所有必需的环境变量都已配置。我们不应该禁用它。

### Q: 可以使用 --build-arg 传递真实值吗？

A: **不推荐**。原因：
- build-arg 会被保存在镜像历史中
- 可以通过 `docker history` 命令看到
- 这样会泄露敏感信息

### Q: 如果我添加了新的环境变量怎么办？

A: 需要同时更新三个地方：
1. `src/env.js` - 添加验证规则
2. `Dockerfile` - 添加虚拟值（builder 阶段）
3. `docker-compose.yml` - 添加真实值映射

### Q: 本地开发时怎么办？

A: 本地开发不受影响：
- 使用 `pnpm dev` 会直接读取 `.env` 文件
- 不需要 Docker
- 环境变量验证正常工作

## 其他修复

### 移除 docker-compose version 警告

```yaml
# 修改前
version: '3.8'
services:
  ...

# 修改后（version 字段已过时）
services:
  ...
```

## 最佳实践

### 1. 不要在镜像中包含敏感信息

❌ 错误做法：
```dockerfile
# 不要这样做！
COPY .env ./
```

✅ 正确做法：
```dockerfile
# .dockerignore 中排除 .env
.env
```

### 2. 分离构建和运行时配置

- **构建时**：虚拟值，用于验证
- **运行时**：真实值，从外部注入

### 3. 使用 .env 管理敏感信息

```bash
# .env（不提交到 git）
DATABASE_URL="postgresql://real:password@localhost:5432/db"
OPENAI_API_KEY="sk-real-key"
```

```yaml
# docker-compose.yml（可以提交）
environment:
  DATABASE_URL: "${DATABASE_URL}"  # 从 .env 读取
```

## 总结

✅ **修复完成**：
- 添加了构建时虚拟环境变量
- 移除了 version 警告
- 保持了安全性

✅ **现在可以成功构建**：
```bash
./deploy.sh build
./deploy.sh start
```

✅ **应用会使用真实配置**：
- 构建时使用虚拟值通过验证
- 运行时使用 .env 中的真实值

---

**需要帮助？**
- 查看构建日志：`docker-compose build`
- 查看运行日志：`./deploy.sh logs`
- 检查环境变量：`docker-compose exec app env`
