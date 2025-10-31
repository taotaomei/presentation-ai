#!/bin/bash

# Presentation AI Docker 部署脚本
# 用法: ./deploy.sh [start|stop|restart|logs|build]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 打印函数
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "docker-compose 未安装，请先安装 docker-compose"
        exit 1
    fi
    
    print_info "Docker 环境检查通过"
}

# 检查环境变量文件
check_env() {
    if [ ! -f .env ]; then
        print_warn ".env 文件不存在"
        if [ -f .env.docker ]; then
            print_info "从 .env.docker 创建 .env 文件..."
            cp .env.docker .env
            print_warn "请编辑 .env 文件并填写真实的环境变量值"
            exit 1
        else
            print_error "请创建 .env 文件并配置环境变量"
            exit 1
        fi
    fi
    print_info "环境变量文件检查通过"
}

# 构建镜像
build() {
    print_info "开始构建 Docker 镜像..."
    docker-compose build --no-cache
    print_info "镜像构建完成"
}

# 启动服务
start() {
    print_info "启动服务..."
    docker-compose up -d
    
    print_info "等待服务启动..."
    sleep 5
    
    # 运行数据库迁移
    print_info "运行数据库迁移..."
    docker-compose exec -T app pnpm prisma db push || true
    
    print_info "服务启动完成！"
    print_info "应用地址: http://localhost:8030"
    print_info "查看日志: ./deploy.sh logs"
}

# 停止服务
stop() {
    print_info "停止服务..."
    docker-compose down
    print_info "服务已停止"
}

# 重启服务
restart() {
    print_info "重启服务..."
    stop
    start
}

# 查看日志
logs() {
    docker-compose logs -f --tail=100
}

# 清理
clean() {
    print_warn "这将删除所有容器、镜像和数据卷"
    read -p "确认删除? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "清理所有资源..."
        docker-compose down -v --rmi all
        print_info "清理完成"
    else
        print_info "取消操作"
    fi
}

# 显示状态
status() {
    print_info "服务状态:"
    docker-compose ps
}

# 主函数
main() {
    check_docker
    
    case "${1:-start}" in
        build)
            check_env
            build
            ;;
        start)
            check_env
            start
            ;;
        stop)
            stop
            ;;
        restart)
            check_env
            restart
            ;;
        logs)
            logs
            ;;
        clean)
            clean
            ;;
        status)
            status
            ;;
        *)
            echo "用法: $0 {build|start|stop|restart|logs|status|clean}"
            echo ""
            echo "命令说明:"
            echo "  build   - 构建 Docker 镜像"
            echo "  start   - 启动服务"
            echo "  stop    - 停止服务"
            echo "  restart - 重启服务"
            echo "  logs    - 查看日志"
            echo "  status  - 查看状态"
            echo "  clean   - 清理所有资源（危险操作）"
            exit 1
            ;;
    esac
}

main "$@"
