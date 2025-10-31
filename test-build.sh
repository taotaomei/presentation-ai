#!/bin/bash

# Docker 构建测试脚本
# 用于验证 Dockerfile 是否可以成功构建

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}Docker 构建测试${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Docker 已安装"

# 检查必需文件
echo ""
echo -e "${YELLOW}检查必需文件...${NC}"

files=(
    "Dockerfile"
    "docker-compose.yml"
    ".dockerignore"
    "package.json"
    "pnpm-lock.yaml"
    "prisma/schema.prisma"
)

for file in "${files[@]}"; do
    if [ ! -e "$file" ]; then
        echo -e "${RED}❌ $file 不存在${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} $file 存在"
done

# 检查环境变量文件
echo ""
echo -e "${YELLOW}检查环境变量文件...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.docker" ]; then
        echo -e "${YELLOW}⚠${NC}  .env 不存在，从 .env.docker 创建..."
        cp .env.docker .env
        echo -e "${GREEN}✓${NC} 已创建 .env 文件"
    else
        echo -e "${RED}❌ .env 和 .env.docker 都不存在${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓${NC} .env 存在"
fi

# 开始构建测试
echo ""
echo -e "${GREEN}=====================================${NC}"
echo -e "${GREEN}开始构建测试...${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""

# 使用 docker-compose 构建
echo -e "${YELLOW}运行: docker-compose build${NC}"
echo ""

if docker-compose build; then
    echo ""
    echo -e "${GREEN}=====================================${NC}"
    echo -e "${GREEN}✓ 构建成功！${NC}"
    echo -e "${GREEN}=====================================${NC}"
    echo ""
    echo "下一步操作："
    echo "1. 编辑 .env 文件，填写真实的环境变量"
    echo "2. 运行: ./deploy.sh start"
    echo "3. 访问: http://YOUR_SERVER_IP:8030"
    echo ""
else
    echo ""
    echo -e "${RED}=====================================${NC}"
    echo -e "${RED}✗ 构建失败${NC}"
    echo -e "${RED}=====================================${NC}"
    echo ""
    echo "请检查错误信息并修复问题。"
    echo ""
    echo "常见问题："
    echo "1. 确保 prisma/schema.prisma 文件存在"
    echo "2. 确保网络连接正常（需要下载依赖）"
    echo "3. 确保有足够的磁盘空间"
    echo ""
    echo "详细文档请参考: DOCKER_BUILD_FIX.md"
    exit 1
fi
