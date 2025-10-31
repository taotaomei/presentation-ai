# 🚀 Docker 部署快速参考

## ⚡ 快速开始（3 步）

```bash
# 1. 配置环境变量
cp .env.docker .env
vim .env  # 填写真实的环境变量

# 2. 构建并启动
./deploy.sh build
./deploy.sh start

# 3. 访问应用
# http://YOUR_SERVER_IP:8030
```

## 📋 常用命令

```bash
# 部署相关
./deploy.sh build      # 构建 Docker 镜像
./deploy.sh start      # 启动服务
./deploy.sh stop       # 停止服务
./deploy.sh restart    # 重启服务
./deploy.sh status     # 查看状态
./deploy.sh logs       # 查看日志
./deploy.sh clean      # 清理所有资源

# 健康检查
./healthcheck.sh       # 运行完整健康检查

# 测试构建
./test-build.sh        # 测试构建是否成功
```

## 🔍 故障排查

### 构建失败

```bash
# 查看详细构建日志
docker-compose build --no-cache --progress=plain

# 检查文件是否存在
ls -la prisma/schema.prisma
ls -la .env

# 检查 .dockerignore
cat .dockerignore | grep -E "(prisma|\.env)"
```

### 容器无法启动

```bash
# 查看容器日志
docker-compose logs app
docker-compose logs postgres

# 检查容器状态
docker-compose ps

# 查看资源使用
docker stats
```

### 数据库连接失败

```bash
# 检查数据库状态
docker-compose exec postgres pg_isready -U presentation

# 重启数据库
docker-compose restart postgres

# 查看数据库日志
docker-compose logs postgres
```

## 🔧 环境变量配置

### 必需配置

```bash
# NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL="http://YOUR_IP:8030"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# OpenAI
OPENAI_API_KEY="sk-your-key"
```

### 可选配置

```bash
TOGETHER_AI_API_KEY="图片生成"
TAVILY_API_KEY="网络搜索"
UNSPLASH_ACCESS_KEY="图片搜索"
UPLOADTHING_TOKEN="文件上传"
```

## 📊 端口配置

| 服务 | 内部端口 | 外部端口 | 说明 |
|------|---------|---------|------|
| App | 8030 | 8030 | Next.js 应用 |
| PostgreSQL | 5432 | 5432 | 数据库（可选暴露） |

## 🔐 安全检查清单

- [ ] 修改了数据库默认密码
- [ ] NEXTAUTH_SECRET 使用强随机值
- [ ] .env 文件权限设置为 600
- [ ] 防火墙只开放必要端口
- [ ] Google OAuth 回调 URL 已配置
- [ ] 生产环境使用 HTTPS

## 📈 性能优化

```yaml
# docker-compose.yml 添加资源限制
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

## 💾 数据备份

```bash
# 备份数据库
docker-compose exec postgres pg_dump -U presentation presentation_db > backup.sql

# 恢复数据库
docker-compose exec -T postgres psql -U presentation presentation_db < backup.sql

# 备份 volume
docker run --rm \
  -v presentation-ai_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres_backup.tar.gz -C /data .
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

# 5. 运行迁移（如需要）
docker-compose exec app pnpm prisma db push
```

## 🐛 常见错误及解决方案

### 错误：端口被占用

```bash
# 查看占用端口的进程
sudo lsof -i :8030
sudo netstat -tlnp | grep 8030

# 解决方案：停止占用的进程或修改端口
```

### 错误：内存不足

```bash
# 检查内存使用
free -h
docker stats

# 解决方案：增加服务器内存或减少资源限制
```

### 错误：磁盘空间不足

```bash
# 检查磁盘使用
df -h

# 清理 Docker 资源
docker system prune -a --volumes
```

### 错误：Google 登录失败

```bash
# 检查配置
echo $GOOGLE_CLIENT_ID
echo $NEXTAUTH_URL

# 验证回调 URL（在 Google Console 中配置）
http://YOUR_IP:8030/api/auth/callback/google
```

## 📚 文档索引

| 文档 | 用途 |
|------|------|
| `QUICK_START.md` | 5分钟快速开始 |
| `DOCKER部署说明.md` | 完整部署指南 |
| `ENV_VARS_FIX.md` | 环境变量问题 |
| `DOCKER_BUILD_FIX.md` | 构建问题修复 |
| `DEPLOYMENT_CHECKLIST.md` | 部署检查清单 |
| `FIX_SUMMARY.md` | 所有修复总结 |
| `CHANGELOG.md` | 更新日志 |

## 🆘 获取帮助

```bash
# 1. 查看日志
./deploy.sh logs

# 2. 运行健康检查
./healthcheck.sh

# 3. 检查容器状态
docker-compose ps

# 4. 查看环境变量
docker-compose exec app env

# 5. 进入容器调试
docker-compose exec app sh
```

## 💡 最佳实践

1. **定期备份数据库**
   ```bash
   # 设置 cron 任务
   0 2 * * * cd /path/to/project && docker-compose exec postgres pg_dump -U presentation presentation_db > backup_$(date +\%Y\%m\%d).sql
   ```

2. **监控日志**
   ```bash
   # 实时监控
   ./deploy.sh logs -f
   ```

3. **资源监控**
   ```bash
   # 持续监控资源使用
   watch -n 1 docker stats
   ```

4. **安全更新**
   ```bash
   # 定期更新基础镜像
   docker-compose pull
   docker-compose up -d
   ```

---

**需要更多帮助？**
- 查看详细文档：`ls *.md`
- 运行健康检查：`./healthcheck.sh`
- 查看日志：`./deploy.sh logs`
