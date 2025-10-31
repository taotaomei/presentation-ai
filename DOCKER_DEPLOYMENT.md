# Docker 部署指南

本文档介绍如何使用 Docker 和 Docker Compose 部署 Presentation AI 项目。

## 📋 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少 4GB 可用内存
- 至少 10GB 可用磁盘空间

## 🚀 快速开始

### 1. 配置环境变量

复制环境变量模板：

```bash
cp .env.docker .env
```

编辑 `.env` 文件并填写以下必需的环境变量：

```bash
# 必需配置
NEXTAUTH_SECRET="生成一个随机密钥"  # 运行: openssl rand -base64 32
NEXTAUTH_URL="http://你的服务器IP:8030"

# Google OAuth (必需)
GOOGLE_CLIENT_ID="从 Google Cloud Console 获取"
GOOGLE_CLIENT_SECRET="从 Google Cloud Console 获取"

# OpenAI API (必需)
OPENAI_API_KEY="sk-你的OpenAI-API-Key"

# 可选但推荐
TOGETHER_AI_API_KEY="用于图片生成"
TAVILY_API_KEY="用于网络搜索"
UNSPLASH_ACCESS_KEY="用于图片搜索"
UPLOADTHING_TOKEN="用于文件上传"
```

### 2. 使用部署脚本

我们提供了一个便捷的部署脚本 `deploy.sh`：

```bash
# 首次部署（构建镜像并启动）
./deploy.sh build
./deploy.sh start

# 或者一键启动（如果已构建）
./deploy.sh start

# 查看日志
./deploy.sh logs

# 重启服务
./deploy.sh restart

# 停止服务
./deploy.sh stop

# 查看状态
./deploy.sh status

# 清理所有资源（危险操作）
./deploy.sh clean
```

### 3. 手动部署（可选）

如果不使用部署脚本，可以手动执行：

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 运行数据库迁移
docker-compose exec app pnpm prisma db push

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 📦 Docker 配置说明

### 端口映射

- **8030:8030** - Next.js 应用端口
- **5432:5432** - PostgreSQL 数据库端口（仅用于调试）

### 数据持久化

项目使用 Docker volume 持久化数据：

- `postgres_data` - PostgreSQL 数据库文件

### 网络配置

所有服务运行在 `presentation-network` 网络中，确保容器间可以相互通信。

## 🔧 高级配置

### 自定义端口

如果需要修改端口，编辑 `docker-compose.yml`：

```yaml
services:
  app:
    ports:
      - "你的端口:8030"  # 例如 "9000:8030"
    environment:
      NEXTAUTH_URL: "http://localhost:你的端口"
```

### 使用外部数据库

如果你有现有的 PostgreSQL 数据库，可以：

1. 在 `docker-compose.yml` 中注释掉 `postgres` 服务
2. 修改 `DATABASE_URL` 环境变量指向你的数据库

```yaml
services:
  app:
    environment:
      DATABASE_URL: "postgresql://user:password@your-db-host:5432/dbname"
```

### 生产环境优化

1. **使用 HTTPS**：配置 Nginx 反向代理
2. **备份数据库**：定期备份 `postgres_data` volume
3. **监控**：使用 Docker 日志和监控工具
4. **更新镜像**：定期更新基础镜像和依赖

## 🛠️ 常见问题

### 问题 1: 容器启动失败

检查日志：
```bash
docker-compose logs app
```

常见原因：
- 环境变量未配置
- 端口被占用
- 内存不足

### 问题 2: 数据库连接失败

确保：
- PostgreSQL 容器正常运行
- DATABASE_URL 配置正确
- 网络连接正常

```bash
# 检查容器状态
docker-compose ps

# 测试数据库连接
docker-compose exec postgres pg_isready -U presentation
```

### 问题 3: 构建失败

清理缓存并重新构建：
```bash
docker-compose build --no-cache
```

### 问题 4: 访问 403/500 错误

检查：
- NextAuth 配置是否正确
- Google OAuth 配置是否正确
- 域名/IP 是否在 Google OAuth 回调 URL 中

## 📊 监控和维护

### 查看容器资源使用

```bash
docker stats
```

### 清理未使用的资源

```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的 volume
docker volume prune
```

### 备份数据库

```bash
# 导出数据库
docker-compose exec postgres pg_dump -U presentation presentation_db > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U presentation presentation_db < backup.sql
```

## 🔐 安全建议

1. **修改默认密码**：更改 `.env` 中的数据库密码
2. **使用强密钥**：确保 `NEXTAUTH_SECRET` 足够随机
3. **限制端口访问**：使用防火墙限制对数据库端口的访问
4. **定期更新**：保持 Docker 镜像和依赖最新
5. **HTTPS**：在生产环境中使用 HTTPS

## 📝 日志管理

```bash
# 查看实时日志
docker-compose logs -f

# 只查看应用日志
docker-compose logs -f app

# 只查看数据库日志
docker-compose logs -f postgres

# 查看最近 100 行日志
docker-compose logs --tail=100
```

## 🎯 性能优化

1. **调整内存限制**：在 `docker-compose.yml` 中添加资源限制
2. **使用 CDN**：为静态资源配置 CDN
3. **数据库优化**：调整 PostgreSQL 配置参数
4. **缓存配置**：配置 Redis 缓存（可选）

## 📞 获取帮助

如果遇到问题：

1. 查看日志：`./deploy.sh logs`
2. 检查容器状态：`./deploy.sh status`
3. 查看 GitHub Issues
4. 联系技术支持

## 📄 相关文件

- `Dockerfile` - Docker 镜像构建配置
- `docker-compose.yml` - Docker Compose 服务配置
- `.dockerignore` - Docker 构建忽略文件
- `.env.docker` - 环境变量模板
- `deploy.sh` - 部署脚本

## 🔄 更新应用

```bash
# 停止服务
./deploy.sh stop

# 拉取最新代码
git pull

# 重新构建镜像
./deploy.sh build

# 启动服务
./deploy.sh start
```

## 📈 扩展部署

对于高流量场景，考虑：

1. 使用 Docker Swarm 或 Kubernetes
2. 配置负载均衡器
3. 分离数据库服务器
4. 使用 Redis 作为会话存储
5. 配置 CDN 和图片优化

---

**提示**: 首次部署建议在测试环境中验证所有配置后再部署到生产环境。
