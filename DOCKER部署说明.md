# Docker 部署说明

## 🎯 部署概述

本项目已配置好 Docker 部署，应用将运行在端口 **8030**（内部和外部端口都是8030）。

## 📦 包含的文件

- `Dockerfile` - Docker 镜像构建文件
- `docker-compose.yml` - Docker Compose 配置（包含数据库）
- `.dockerignore` - Docker 构建忽略文件
- `.env.docker` - 环境变量模板
- `deploy.sh` - 一键部署脚本
- `healthcheck.sh` - 健康检查脚本
- `nginx.conf` - Nginx 反向代理配置示例

## 🚀 快速部署（3步完成）

### 第1步：配置环境变量

```bash
# 复制环境变量模板
cp .env.docker .env

# 编辑 .env 文件
vim .env
```

**必须配置的变量：**

```bash
# 1. NextAuth 配置
NEXTAUTH_SECRET="随机生成的密钥"  # 运行: openssl rand -base64 32
NEXTAUTH_URL="http://你的服务器IP:8030"

# 2. Google OAuth（从 Google Cloud Console 获取）
GOOGLE_CLIENT_ID="你的Google客户端ID"
GOOGLE_CLIENT_SECRET="你的Google客户端密钥"

# 3. OpenAI API Key（从 OpenAI 官网获取）
OPENAI_API_KEY="sk-你的OpenAI密钥"

# 4. 可选但推荐配置
TOGETHER_AI_API_KEY="用于AI图片生成"
TAVILY_API_KEY="用于网络搜索"
UNSPLASH_ACCESS_KEY="用于图库搜索"
```

### 第2步：构建并启动

```bash
# 赋予脚本执行权限
chmod +x deploy.sh

# 构建 Docker 镜像
./deploy.sh build

# 启动服务
./deploy.sh start
```

### 第3步：验证部署

```bash
# 检查服务状态
./deploy.sh status

# 查看日志
./deploy.sh logs

# 运行健康检查
chmod +x healthcheck.sh
./healthcheck.sh
```

## 🌐 访问应用

部署成功后，在浏览器中访问：

```
http://你的服务器IP:8030
```

## 📋 部署脚本命令

```bash
./deploy.sh build    # 构建 Docker 镜像
./deploy.sh start    # 启动服务
./deploy.sh stop     # 停止服务
./deploy.sh restart  # 重启服务
./deploy.sh logs     # 查看日志
./deploy.sh status   # 查看状态
./deploy.sh clean    # 清理所有资源（危险操作）
```

## 🔧 手动部署（不使用脚本）

如果你想手动控制每一步：

```bash
# 1. 构建镜像
docker-compose build --no-cache

# 2. 启动服务
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 停止服务
docker-compose down
```

## 📊 服务组成

部署包含以下服务：

1. **app** - Next.js 应用（端口 8030）
2. **postgres** - PostgreSQL 数据库（端口 5432）

## 🔍 常见问题

### 问题1：端口被占用

```bash
# 检查端口占用
sudo netstat -tlnp | grep 8030

# 或者修改 docker-compose.yml 中的端口映射
```

### 问题2：数据库连接失败

```bash
# 检查数据库容器状态
docker-compose ps

# 检查数据库健康状态
docker-compose exec postgres pg_isready -U presentation

# 重启数据库
docker-compose restart postgres
```

### 问题3：应用无法访问

1. 检查防火墙是否开放 8030 端口：
   ```bash
   sudo ufw allow 8030
   ```

2. 检查容器日志：
   ```bash
   docker-compose logs app
   ```

3. 验证环境变量配置是否正确

### 问题4：Google 登录失败

确保在 Google Cloud Console 中配置了正确的回调URL：

```
http://你的服务器IP:8030/api/auth/callback/google
```

## 🔐 安全建议

1. **修改默认密码**
   - 在 `.env` 中修改数据库密码
   - 使用强密码

2. **生成强密钥**
   ```bash
   openssl rand -base64 32
   ```

3. **配置防火墙**
   ```bash
   # 只允许必要的端口
   sudo ufw allow 8030/tcp
   sudo ufw enable
   ```

4. **使用 HTTPS**
   - 生产环境建议使用 Nginx 反向代理
   - 配置 SSL 证书（Let's Encrypt）

## 📈 性能优化

### 调整内存限制

在 `docker-compose.yml` 中添加：

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 2G
        reservations:
          memory: 1G
```

### 数据库优化

```yaml
services:
  postgres:
    command: >
      postgres
      -c shared_buffers=256MB
      -c max_connections=200
      -c work_mem=8MB
```

## 🔄 更新应用

```bash
# 1. 停止服务
./deploy.sh stop

# 2. 拉取最新代码
git pull

# 3. 重新构建
./deploy.sh build

# 4. 启动服务
./deploy.sh start

# 5. 运行数据库迁移（如果需要）
docker-compose exec app pnpm prisma db push
```

## 💾 数据备份

### 备份数据库

```bash
# 备份
docker-compose exec postgres pg_dump -U presentation presentation_db > backup_$(date +%Y%m%d).sql

# 恢复
docker-compose exec -T postgres psql -U presentation presentation_db < backup_20240101.sql
```

### 备份 Docker Volume

```bash
# 备份
docker run --rm \
  -v presentation-ai_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz -C /data .

# 恢复
docker run --rm \
  -v presentation-ai_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/postgres_backup.tar.gz -C /data
```

## 📊 监控

### 查看资源使用

```bash
# 实时监控
docker stats

# 查看容器详情
docker-compose ps -a
```

### 日志管理

```bash
# 查看实时日志
docker-compose logs -f

# 查看最近100行
docker-compose logs --tail=100

# 只查看应用日志
docker-compose logs -f app

# 只查看数据库日志
docker-compose logs -f postgres
```

## 🌐 生产环境部署

### 使用 Nginx 反向代理

1. 安装 Nginx：
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. 复制配置：
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/presentation
   sudo ln -s /etc/nginx/sites-available/presentation /etc/nginx/sites-enabled/
   ```

3. 修改域名：
   ```bash
   sudo vim /etc/nginx/sites-available/presentation
   # 修改 server_name 为你的域名
   ```

4. 测试并重启：
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

### 配置 SSL 证书（Let's Encrypt）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

## 🐛 调试技巧

```bash
# 进入容器
docker-compose exec app sh

# 查看环境变量
docker-compose exec app env

# 检查网络
docker network inspect presentation-ai_presentation-network

# 查看容器详细信息
docker inspect presentation-app
```

## 📞 获取支持

如果遇到问题：

1. **查看日志**：`./deploy.sh logs`
2. **检查状态**：`./deploy.sh status`
3. **运行健康检查**：`./healthcheck.sh`
4. **查阅文档**：`DOCKER_DEPLOYMENT.md`

## 📝 注意事项

1. **首次部署时间**：第一次构建可能需要 5-10 分钟
2. **内存要求**：建议至少 2GB 可用内存
3. **磁盘空间**：建议至少 10GB 可用空间
4. **网络要求**：需要能够访问 Docker Hub、GitHub 等服务

## ✅ 部署检查清单

部署前请确认：

- [ ] Docker 和 Docker Compose 已安装
- [ ] 已配置所有必需的环境变量
- [ ] 防火墙允许 8030 端口
- [ ] 有足够的内存和磁盘空间
- [ ] Google OAuth 回调 URL 已配置
- [ ] 数据库密码已修改（生产环境）
- [ ] NEXTAUTH_SECRET 已生成强密钥

---

**祝部署顺利！** 🎉

如有问题，请查看详细文档或联系技术支持。
