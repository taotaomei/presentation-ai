# 更新日志

## [2024-10-31] 环境变量构建问题修复

### 🔧 修复

- **环境变量验证失败问题**
  - 在 builder 阶段添加虚拟环境变量
  - 修复了 Next.js 构建时 env.js 验证失败的错误
  - 真实环境变量在运行时通过 docker-compose 注入
  
- **docker-compose version 警告**
  - 移除了过时的 `version: '3.8'` 字段
  - 消除了构建时的警告信息

### 📝 变更详情

**问题：**
```
❌ Invalid environment variables: {
  DATABASE_URL: [ 'Required' ],
  NEXTAUTH_SECRET: [ 'Required' ],
  ...
}
```

**原因：**
- `.env` 文件被 `.dockerignore` 排除（正确的安全做法）
- Next.js 的 `src/env.js` 在构建时验证环境变量
- docker-compose 的环境变量只在运行时注入

**解决方案：**
```dockerfile
# Stage 2: builder
# 添加虚拟环境变量（仅用于构建时验证）
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"
ENV NEXTAUTH_SECRET="build-time-secret"
ENV OPENAI_API_KEY="sk-build-key"
# ... 其他必需的环境变量
```

### 🎯 影响范围

- ✅ Docker 构建现在可以成功完成
- ✅ 安全性保持不变（真实密钥不会打包到镜像）
- ✅ 运行时使用 .env 文件中的真实配置

### 📚 相关文档

- `ENV_VARS_FIX.md` - 环境变量问题详细说明
- `DOCKER_BUILD_FIX.md` - 已更新，包含环境变量部分
- `Dockerfile` - 已更新
- `docker-compose.yml` - 已更新（移除 version）

---

## [2024-10-31] Docker 构建修复

### 🔧 修复

- **Dockerfile 构建失败问题**
  - 在 deps 阶段添加 prisma 目录复制
  - 修复了 `prisma generate` 找不到 schema 文件的错误
  - 现在构建可以正常完成

### 📝 变更详情

**修改前的问题：**
```dockerfile
# deps 阶段只复制了 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile  # ← postinstall 运行 prisma generate 失败
```

**修改后：**
```dockerfile
# deps 阶段同时复制 prisma 目录
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/  # ← 添加这一行
RUN pnpm install --frozen-lockfile  # ← postinstall 现在可以成功运行
```

### 🎯 影响范围

- ✅ Docker 本地构建
- ✅ docker-compose 构建
- ✅ CI/CD 自动构建
- ✅ 生产环境部署

### 📚 相关文档

- `DOCKER_BUILD_FIX.md` - 详细的修复说明
- `Dockerfile` - 已更新
- `QUICK_START.md` - 部署指南
- `DOCKER部署说明.md` - 完整部署文档

---

## [2024-10-31] 初始功能发布

### ✨ 新功能

#### 1. 自定义 BaseURL 支持
- 添加自定义 API BaseURL 配置
- API Key 管理（带显示/隐藏功能）
- 模型列表自动获取
- 模糊搜索功能
- LocalStorage 持久化

#### 2. Docker 部署支持
- 完整的 Docker 配置
- docker-compose 编排
- 一键部署脚本
- 健康检查脚本
- Nginx 反向代理配置

### 📦 新增文件

**核心功能：**
- `src/components/presentation/dashboard/CustomModelConfig.tsx`
- `src/components/presentation/dashboard/ModelPicker.tsx` (重构)
- `src/hooks/presentation/useLocalModels.ts` (扩展)

**Docker 部署：**
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`
- `.env.docker`
- `deploy.sh`
- `healthcheck.sh`
- `nginx.conf`

**文档：**
- `DOCKER部署说明.md`
- `DOCKER_DEPLOYMENT.md`
- `QUICK_START.md`
- `DEPLOYMENT_CHECKLIST.md`
- `DEPLOYMENT_FILES_SUMMARY.md`
- `README_DOCKER.md`
- `DOCKER_SETUP_COMPLETE.md`
- `TASK_COMPLETION_SUMMARY.md`
- `IMPLEMENTATION_SUMMARY.md`

### 🔄 修改文件

- `next.config.js` - 添加 standalone 输出
- `.gitignore` - 添加 Docker 相关
- `src/states/presentation-state.ts` - 扩展状态
- `src/lib/model-picker.ts` - 支持自定义提供商
- API 路由 - 支持自定义配置
- 组件 - 集成新功能

### 🎨 UI/UX 改进

- 模型选择器支持搜索
- 配置自动保存
- 分组显示模型
- 图标和视觉指示

### 🔐 安全改进

- Docker 容器使用非 root 用户
- 环境变量管理
- API Key 隐藏显示

### 📊 性能优化

- 多阶段 Docker 构建
- 模型列表缓存（5分钟）
- Alpine Linux 镜像（轻量级）

---

## 使用说明

### 自定义 BaseURL

1. 打开应用主页
2. 在"Custom API Configuration"部分输入配置
3. 选择模型（支持搜索）
4. 开始生成演示文稿

### Docker 部署

```bash
# 快速部署
cp .env.docker .env
vim .env  # 配置环境变量
./deploy.sh build
./deploy.sh start
```

访问：`http://YOUR_SERVER_IP:8030`

---

**完整文档请参考：**
- 快速开始：`QUICK_START.md`
- Docker 部署：`DOCKER部署说明.md`
- 功能说明：`IMPLEMENTATION_SUMMARY.md`
