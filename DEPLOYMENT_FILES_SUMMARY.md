# Docker 部署文件说明

本文档说明所有 Docker 部署相关文件的用途和使用方法。

## 📁 文件列表

### 核心配置文件

| 文件名 | 用途 | 是否必需 |
|--------|------|----------|
| `Dockerfile` | Docker 镜像构建配置 | ✅ 必需 |
| `docker-compose.yml` | Docker Compose 服务编排 | ✅ 必需 |
| `.dockerignore` | Docker 构建忽略文件 | ✅ 推荐 |
| `.env.docker` | 环境变量模板 | ✅ 必需 |
| `next.config.js` | Next.js 配置（已添加 standalone 输出） | ✅ 必需 |

### 脚本工具

| 文件名 | 用途 | 是否必需 |
|--------|------|----------|
| `deploy.sh` | 一键部署脚本 | 🟡 推荐 |
| `healthcheck.sh` | 健康检查脚本 | 🟡 推荐 |

### 配置示例

| 文件名 | 用途 | 是否必需 |
|--------|------|----------|
| `nginx.conf` | Nginx 反向代理配置示例 | 🔵 可选 |

### 文档

| 文件名 | 用途 | 是否必需 |
|--------|------|----------|
| `DOCKER_DEPLOYMENT.md` | 详细部署文档（英文） | 📖 参考 |
| `DOCKER部署说明.md` | 详细部署文档（中文） | 📖 参考 |
| `QUICK_START.md` | 快速启动指南 | 📖 参考 |
| `DEPLOYMENT_FILES_SUMMARY.md` | 本文档 | 📖 参考 |

## 📋 文件详解

### 1. Dockerfile

**用途**：定义 Docker 镜像的构建过程

**特点**：
- 多阶段构建（减小镜像大小）
- 基于 Node.js 20 Alpine（轻量级）
- 包含 Prisma Client 生成
- 使用非 root 用户运行（安全）
- 暴露端口 8030

**修改说明**：
- 如需更改端口，修改 `ENV PORT=8030` 和 `EXPOSE 8030`
- 如需自定义构建命令，修改 `RUN pnpm build`

### 2. docker-compose.yml

**用途**：定义和管理多个 Docker 容器

**包含服务**：
- `app`: Next.js 应用（端口 8030）
- `postgres`: PostgreSQL 数据库（端口 5432）

**特点**：
- 自动网络配置
- 数据持久化（使用 volume）
- 健康检查
- 环境变量管理

**修改说明**：
- 端口映射：修改 `ports` 部分
- 数据库配置：修改 `postgres` 服务的环境变量
- 资源限制：添加 `deploy.resources` 配置

### 3. .dockerignore

**用途**：指定 Docker 构建时忽略的文件

**包含**：
- node_modules
- .git
- 日志文件
- 临时文件
- 开发文件

**好处**：
- 减小构建上下文大小
- 加快构建速度
- 避免敏感文件泄露

### 4. .env.docker

**用途**：环境变量配置模板

**必需配置**：
```bash
DATABASE_URL                # 数据库连接
NEXTAUTH_SECRET            # NextAuth 密钥
NEXTAUTH_URL               # 应用访问地址
GOOGLE_CLIENT_ID           # Google OAuth ID
GOOGLE_CLIENT_SECRET       # Google OAuth 密钥
OPENAI_API_KEY            # OpenAI API Key
```

**可选配置**：
```bash
TOGETHER_AI_API_KEY       # AI 图片生成
TAVILY_API_KEY            # 网络搜索
UNSPLASH_ACCESS_KEY       # 图库搜索
UPLOADTHING_TOKEN         # 文件上传
```

### 5. deploy.sh

**用途**：自动化部署脚本

**命令**：
```bash
./deploy.sh build     # 构建镜像
./deploy.sh start     # 启动服务
./deploy.sh stop      # 停止服务
./deploy.sh restart   # 重启服务
./deploy.sh logs      # 查看日志
./deploy.sh status    # 查看状态
./deploy.sh clean     # 清理资源
```

**功能**：
- 自动检查 Docker 环境
- 验证环境变量文件
- 执行数据库迁移
- 提供彩色输出

### 6. healthcheck.sh

**用途**：健康检查脚本

**检查内容**：
- 容器运行状态
- 数据库连接
- 应用响应

**使用方式**：
```bash
./healthcheck.sh
```

### 7. nginx.conf

**用途**：Nginx 反向代理配置示例

**特点**：
- HTTP 到 HTTPS 重定向
- SSL/TLS 配置
- 安全头设置
- WebSocket 支持
- 静态文件缓存

**使用场景**：
- 生产环境部署
- 需要 HTTPS
- 需要负载均衡

## 🚀 部署流程

### 方式1：使用部署脚本（推荐）

```bash
# 1. 配置环境变量
cp .env.docker .env
vim .env

# 2. 赋予执行权限
chmod +x deploy.sh

# 3. 构建并启动
./deploy.sh build
./deploy.sh start

# 4. 检查状态
./deploy.sh status
./deploy.sh logs
```

### 方式2：手动部署

```bash
# 1. 配置环境变量
cp .env.docker .env
vim .env

# 2. 构建镜像
docker-compose build

# 3. 启动服务
docker-compose up -d

# 4. 运行迁移
docker-compose exec app pnpm prisma db push

# 5. 查看日志
docker-compose logs -f
```

## 🔧 配置修改指南

### 修改端口

**修改文件**：
1. `docker-compose.yml` - 端口映射
2. `.env` - NEXTAUTH_URL

**示例**：将 8030 改为 9000

```yaml
# docker-compose.yml
services:
  app:
    ports:
      - "9000:8030"  # 外部端口:内部端口
```

```bash
# .env
NEXTAUTH_URL="http://your-ip:9000"
```

### 使用外部数据库

**修改文件**：
1. `docker-compose.yml` - 注释掉 postgres 服务
2. `.env` - 修改 DATABASE_URL

```yaml
# docker-compose.yml
# 注释掉以下部分
# postgres:
#   image: postgres:16-alpine
#   ...
```

```bash
# .env
DATABASE_URL="postgresql://user:pass@external-db:5432/dbname"
```

### 添加资源限制

**修改文件**：`docker-compose.yml`

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

## 📊 监控和维护

### 查看日志

```bash
# 实时日志
./deploy.sh logs

# 或手动
docker-compose logs -f
docker-compose logs -f app    # 只看应用
docker-compose logs -f postgres  # 只看数据库
```

### 查看资源使用

```bash
# 实时监控
docker stats

# 容器详情
docker-compose ps
```

### 数据备份

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U presentation presentation_db > backup.sql

# 备份 volume
docker run --rm \
  -v presentation-ai_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz -C /data .
```

## 🔐 安全最佳实践

1. **修改默认凭据**
   - 更改数据库密码
   - 生成强 NEXTAUTH_SECRET

2. **使用 HTTPS**
   - 配置 Nginx SSL
   - 使用 Let's Encrypt

3. **限制端口访问**
   ```bash
   sudo ufw allow 8030/tcp
   ```

4. **定期更新**
   - 更新基础镜像
   - 更新依赖包

5. **日志管理**
   - 配置日志轮转
   - 监控异常日志

## 🐛 故障排除

### 构建失败

```bash
# 清理缓存重新构建
docker-compose build --no-cache
```

### 启动失败

```bash
# 查看详细日志
docker-compose logs app

# 检查环境变量
docker-compose exec app env
```

### 数据库连接失败

```bash
# 检查数据库状态
docker-compose exec postgres pg_isready -U presentation

# 重启数据库
docker-compose restart postgres
```

### 端口被占用

```bash
# 查找占用端口的进程
sudo lsof -i :8030

# 或修改端口
vim docker-compose.yml
```

## 📚 相关文档

- **快速开始**：`QUICK_START.md`
- **详细部署**：`DOCKER_DEPLOYMENT.md` 或 `DOCKER部署说明.md`
- **项目说明**：`README.md`
- **功能实现**：`IMPLEMENTATION_SUMMARY.md`

## 📞 获取帮助

如果遇到问题：

1. 查看日志：`./deploy.sh logs`
2. 运行健康检查：`./healthcheck.sh`
3. 查阅相关文档
4. 检查 GitHub Issues

---

**提示**：建议先在测试环境验证配置，确认无误后再部署到生产环境。
