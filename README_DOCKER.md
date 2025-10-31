# 🐳 Docker 部署完整指南

## 📦 部署文件清单

所有 Docker 部署所需的文件已经准备就绪：

### ✅ 必需文件
- `Dockerfile` - Docker 镜像构建配置
- `docker-compose.yml` - 容器编排配置
- `.dockerignore` - 构建忽略文件
- `.env.docker` - 环境变量模板

### 🛠️ 工具脚本
- `deploy.sh` - 一键部署脚本（已添加执行权限）
- `healthcheck.sh` - 健康检查脚本（已添加执行权限）

### 📚 文档
- `DOCKER部署说明.md` - **中文详细部署指南**（推荐阅读）
- `DOCKER_DEPLOYMENT.md` - 英文详细部署指南
- `QUICK_START.md` - 5分钟快速启动指南
- `DEPLOYMENT_FILES_SUMMARY.md` - 所有文件说明

### 🔧 可选配置
- `nginx.conf` - Nginx 反向代理配置示例

## 🚀 快速部署（仅需3步）

### 第1步：配置环境变量

```bash
cp .env.docker .env
vim .env  # 或使用 nano .env
```

**最少配置这些变量：**

```bash
# 生成随机密钥
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# 替换为你的服务器IP
NEXTAUTH_URL="http://YOUR_SERVER_IP:8030"

# Google OAuth 配置
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# OpenAI API Key
OPENAI_API_KEY="sk-your-openai-api-key"
```

### 第2步：构建并启动

```bash
# 使用一键部署脚本
./deploy.sh build
./deploy.sh start
```

### 第3步：访问应用

打开浏览器访问：`http://YOUR_SERVER_IP:8030`

## 📖 详细文档

根据你的需求选择合适的文档：

1. **快速部署** → 阅读 `QUICK_START.md`
2. **详细配置** → 阅读 `DOCKER部署说明.md`（中文）或 `DOCKER_DEPLOYMENT.md`（英文）
3. **文件说明** → 阅读 `DEPLOYMENT_FILES_SUMMARY.md`

## 🎯 部署特点

- ✅ **端口配置**：内外端口均为 8030（可自定义）
- ✅ **包含数据库**：自动部署 PostgreSQL
- ✅ **数据持久化**：使用 Docker volume
- ✅ **健康检查**：自动监控服务状态
- ✅ **一键部署**：使用脚本简化操作
- ✅ **生产就绪**：优化的多阶段构建

## 📋 常用命令

```bash
# 查看服务状态
./deploy.sh status

# 查看实时日志
./deploy.sh logs

# 重启服务
./deploy.sh restart

# 停止服务
./deploy.sh stop

# 健康检查
./healthcheck.sh
```

## 🔐 安全提示

1. **修改默认密码**：`.env` 中的数据库密码
2. **使用强密钥**：NEXTAUTH_SECRET 必须足够随机
3. **配置防火墙**：只开放必要端口
4. **使用 HTTPS**：生产环境建议配置 SSL

## 📊 系统要求

- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **内存**: 至少 2GB
- **磁盘**: 至少 10GB
- **端口**: 8030（或自定义）

## 🆘 遇到问题？

1. 查看日志：`./deploy.sh logs`
2. 检查状态：`./deploy.sh status`
3. 健康检查：`./healthcheck.sh`
4. 阅读文档：`DOCKER部署说明.md`

## 🎉 部署成功后

访问 `http://YOUR_SERVER_IP:8030`，你应该能看到：

1. 登录页面
2. Google OAuth 登录选项
3. 应用主界面

## 📝 下一步

部署成功后，你可以：

1. 配置自定义域名
2. 设置 HTTPS（使用 nginx.conf）
3. 配置备份策略
4. 设置监控告警
5. 优化性能配置

---

**需要帮助？** 查看详细文档或提交 Issue。

**部署愉快！** 🚀
