# 🚀 快速启动指南

5分钟快速部署 Presentation AI 到 Docker 容器。

## 步骤 1: 准备环境变量

```bash
# 复制环境变量模板
cp .env.docker .env

# 编辑环境变量（使用你喜欢的编辑器）
nano .env
# 或
vim .env
```

最少需要配置这些：

```bash
# 生成随机密钥
NEXTAUTH_SECRET="运行命令: openssl rand -base64 32"

# 替换为你的服务器IP或域名
NEXTAUTH_URL="http://你的IP:8030"

# 从 https://console.cloud.google.com/ 获取
GOOGLE_CLIENT_ID="你的-client-id"
GOOGLE_CLIENT_SECRET="你的-client-secret"

# 从 https://platform.openai.com/api-keys 获取
OPENAI_API_KEY="sk-你的-api-key"
```

## 步骤 2: 启动服务

```bash
# 一键部署
./deploy.sh build
./deploy.sh start
```

## 步骤 3: 验证部署

```bash
# 查看日志
./deploy.sh logs

# 检查健康状态
./healthcheck.sh
```

## 步骤 4: 访问应用

打开浏览器访问：`http://你的服务器IP:8030`

---

## 🎯 常用命令

```bash
# 查看运行状态
./deploy.sh status

# 重启服务
./deploy.sh restart

# 停止服务
./deploy.sh stop

# 查看实时日志
./deploy.sh logs
```

## 🔧 故障排除

### 问题：端口被占用

```bash
# 查看占用 8030 端口的进程
sudo lsof -i :8030

# 或者修改 docker-compose.yml 中的端口
```

### 问题：数据库连接失败

```bash
# 检查数据库状态
docker-compose exec postgres pg_isready -U presentation

# 重启数据库
docker-compose restart postgres
```

### 问题：内存不足

```bash
# 检查 Docker 资源使用
docker stats

# 如果内存不足，在 docker-compose.yml 中减少资源限制
```

## 📚 更多文档

- [完整部署指南](./DOCKER_DEPLOYMENT.md)
- [项目 README](./README.md)
- [实现总结](./IMPLEMENTATION_SUMMARY.md)

## 🆘 需要帮助？

1. 查看日志：`./deploy.sh logs`
2. 检查配置：确保所有环境变量都已正确填写
3. 验证 Google OAuth 回调 URL 已添加
4. 确保防火墙允许 8030 端口

---

**提示**: 首次启动可能需要几分钟来下载镜像和构建应用。请耐心等待！
