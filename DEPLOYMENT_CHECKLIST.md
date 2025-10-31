# ✅ Docker 部署检查清单

在部署到生产环境之前，请确保完成以下所有检查项。

## 📋 部署前检查

### 1. 系统环境

- [ ] 服务器已安装 Docker (v20.10+)
- [ ] 服务器已安装 Docker Compose (v2.0+)
- [ ] 服务器有至少 2GB 可用内存
- [ ] 服务器有至少 10GB 可用磁盘空间
- [ ] 服务器网络正常，可以访问外网

验证命令：
```bash
docker --version
docker-compose --version
free -h
df -h
```

### 2. 文件准备

- [ ] 已下载/拉取最新代码
- [ ] 所有 Docker 相关文件存在：
  - [ ] `Dockerfile`
  - [ ] `docker-compose.yml`
  - [ ] `.dockerignore`
  - [ ] `.env.docker`
  - [ ] `deploy.sh`
  - [ ] `healthcheck.sh`

验证命令：
```bash
ls -lh Dockerfile docker-compose.yml .dockerignore .env.docker deploy.sh healthcheck.sh
```

### 3. 环境变量配置

- [ ] 已复制 `.env.docker` 为 `.env`
- [ ] 已配置必需的环境变量：

#### 必需配置（必须填写）

- [ ] `DATABASE_URL` - 数据库连接字符串
  ```bash
  DATABASE_URL="postgresql://presentation:YOUR_PASSWORD@postgres:5432/presentation_db"
  ```

- [ ] `NEXTAUTH_SECRET` - NextAuth 加密密钥（强随机字符串）
  ```bash
  # 生成命令: openssl rand -base64 32
  NEXTAUTH_SECRET="生成的随机密钥"
  ```

- [ ] `NEXTAUTH_URL` - 应用访问地址
  ```bash
  NEXTAUTH_URL="http://YOUR_SERVER_IP:8030"
  # 或域名: https://your-domain.com
  ```

- [ ] `GOOGLE_CLIENT_ID` - Google OAuth 客户端ID
  ```bash
  GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
  ```

- [ ] `GOOGLE_CLIENT_SECRET` - Google OAuth 客户端密钥
  ```bash
  GOOGLE_CLIENT_SECRET="your-client-secret"
  ```

- [ ] `OPENAI_API_KEY` - OpenAI API 密钥（用于文本生成）
  ```bash
  OPENAI_API_KEY="sk-your-api-key"
  ```

#### 可选配置（推荐填写）

- [ ] `TOGETHER_AI_API_KEY` - Together AI 密钥（用于AI图片生成）
- [ ] `TAVILY_API_KEY` - Tavily 密钥（用于网络搜索功能）
- [ ] `UNSPLASH_ACCESS_KEY` - Unsplash 密钥（用于图库搜索）
- [ ] `UPLOADTHING_TOKEN` - UploadThing 令牌（用于文件上传）

### 4. Google OAuth 配置

- [ ] 已在 Google Cloud Console 创建 OAuth 2.0 客户端
- [ ] 已添加授权的重定向 URI：
  ```
  http://YOUR_SERVER_IP:8030/api/auth/callback/google
  ```
  或
  ```
  https://your-domain.com/api/auth/callback/google
  ```
- [ ] 已启用 Google+ API

配置地址：https://console.cloud.google.com/apis/credentials

### 5. 端口和网络

- [ ] 确认端口 8030 未被占用
  ```bash
  sudo netstat -tlnp | grep 8030
  # 或
  sudo lsof -i :8030
  ```

- [ ] 防火墙已开放端口 8030
  ```bash
  sudo ufw allow 8030/tcp
  sudo ufw status
  ```

- [ ] 如使用云服务器，安全组已开放端口 8030

### 6. 脚本权限

- [ ] 部署脚本有执行权限
  ```bash
  chmod +x deploy.sh
  chmod +x healthcheck.sh
  ```

## 🚀 部署步骤

### 1. 构建镜像

- [ ] 执行构建命令
  ```bash
  ./deploy.sh build
  ```

- [ ] 构建成功，无错误

### 2. 启动服务

- [ ] 执行启动命令
  ```bash
  ./deploy.sh start
  ```

- [ ] 等待服务启动（约 30-60 秒）

### 3. 验证部署

- [ ] 检查容器状态
  ```bash
  ./deploy.sh status
  ```

- [ ] 所有容器状态为 "Up"

- [ ] 查看日志无严重错误
  ```bash
  ./deploy.sh logs
  ```

- [ ] 运行健康检查
  ```bash
  ./healthcheck.sh
  ```

- [ ] 健康检查全部通过

### 4. 功能测试

- [ ] 浏览器访问 `http://YOUR_SERVER_IP:8030`
- [ ] 页面正常加载
- [ ] Google 登录按钮显示
- [ ] 点击 Google 登录，跳转正常
- [ ] 登录成功后能访问主界面
- [ ] 创建测试演示文稿
- [ ] AI 生成功能正常
- [ ] 图片加载正常

## 🔐 安全检查

### 生产环境必须完成

- [ ] 已修改数据库默认密码
- [ ] NEXTAUTH_SECRET 使用强随机密钥
- [ ] 已删除或保护 .env 文件权限
  ```bash
  chmod 600 .env
  ```
- [ ] 防火墙只开放必要端口
- [ ] 已配置 HTTPS（生产环境）
- [ ] 已设置日志轮转
- [ ] 已配置自动备份

### HTTPS 配置（生产环境推荐）

- [ ] 已安装 Nginx
- [ ] 已配置 Nginx 反向代理
- [ ] 已获取 SSL 证书（Let's Encrypt）
- [ ] 已配置 SSL 证书自动续期
- [ ] NEXTAUTH_URL 使用 HTTPS 地址

## 📊 监控和维护

### 日常监控

- [ ] 定期查看日志
  ```bash
  ./deploy.sh logs
  ```

- [ ] 监控资源使用
  ```bash
  docker stats
  ```

- [ ] 定期运行健康检查
  ```bash
  ./healthcheck.sh
  ```

### 备份计划

- [ ] 已设置数据库自动备份
  ```bash
  # 手动备份示例
  docker-compose exec postgres pg_dump -U presentation presentation_db > backup_$(date +%Y%m%d).sql
  ```

- [ ] 已设置 Docker volume 备份
- [ ] 已设置配置文件备份（.env 等）
- [ ] 已测试恢复流程

### 更新计划

- [ ] 已记录当前版本
- [ ] 已制定更新流程
- [ ] 已准备回滚方案

## 🆘 故障排除

### 常见问题检查

如果遇到问题，按顺序检查：

1. **容器无法启动**
   - [ ] 查看详细日志：`docker-compose logs app`
   - [ ] 检查端口占用
   - [ ] 验证环境变量配置

2. **数据库连接失败**
   - [ ] 检查数据库容器状态：`docker-compose ps`
   - [ ] 测试数据库连接：`docker-compose exec postgres pg_isready`
   - [ ] 验证 DATABASE_URL 配置

3. **应用无法访问**
   - [ ] 检查防火墙设置
   - [ ] 验证端口映射
   - [ ] 查看 Nginx 配置（如果使用）

4. **Google 登录失败**
   - [ ] 验证 Google OAuth 配置
   - [ ] 检查回调 URL 配置
   - [ ] 查看浏览器控制台错误

5. **AI 功能无法使用**
   - [ ] 验证 API Key 配置
   - [ ] 检查 API 配额和余额
   - [ ] 查看应用日志

## 📝 部署记录

部署完成后，记录以下信息：

- **部署日期**: _______________
- **部署人员**: _______________
- **服务器IP**: _______________
- **应用版本**: _______________
- **Docker版本**: _______________
- **备注**: _______________

## ✅ 最终确认

部署完成前，最后确认：

- [ ] 所有检查项已完成
- [ ] 应用可以正常访问
- [ ] 主要功能测试通过
- [ ] 日志无严重错误
- [ ] 备份策略已设置
- [ ] 监控机制已建立
- [ ] 紧急联系方式已记录

## 🎉 部署完成

恭喜！如果以上所有检查项都已完成，您的 Presentation AI 应用已成功部署。

### 下一步

1. 向团队成员分享访问地址
2. 配置监控告警
3. 定期检查系统状态
4. 收集用户反馈
5. 计划功能迭代

---

**需要帮助？** 查看 `DOCKER部署说明.md` 或联系技术支持。

**部署愉快！** 🚀
