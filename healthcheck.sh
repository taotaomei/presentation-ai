#!/bin/bash

# 健康检查脚本
# 用于监控应用是否正常运行

HEALTH_URL="http://localhost:8030"
MAX_RETRIES=3
RETRY_DELAY=5

check_health() {
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        # 检查应用是否响应
        if curl -f -s -o /dev/null "$HEALTH_URL"; then
            echo "✓ 应用健康检查通过"
            return 0
        fi
        
        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            echo "✗ 健康检查失败，${RETRY_DELAY}秒后重试... ($retries/$MAX_RETRIES)"
            sleep $RETRY_DELAY
        fi
    done
    
    echo "✗ 应用健康检查失败"
    return 1
}

check_database() {
    # 检查数据库连接
    if docker-compose exec -T postgres pg_isready -U presentation > /dev/null 2>&1; then
        echo "✓ 数据库连接正常"
        return 0
    else
        echo "✗ 数据库连接失败"
        return 1
    fi
}

check_containers() {
    # 检查容器状态
    local app_status=$(docker-compose ps -q app | xargs docker inspect -f '{{.State.Status}}')
    local db_status=$(docker-compose ps -q postgres | xargs docker inspect -f '{{.State.Status}}')
    
    echo "应用容器状态: $app_status"
    echo "数据库容器状态: $db_status"
    
    if [ "$app_status" = "running" ] && [ "$db_status" = "running" ]; then
        echo "✓ 所有容器运行正常"
        return 0
    else
        echo "✗ 部分容器未运行"
        return 1
    fi
}

main() {
    echo "===================="
    echo "开始健康检查..."
    echo "===================="
    echo ""
    
    check_containers
    container_result=$?
    echo ""
    
    check_database
    database_result=$?
    echo ""
    
    check_health
    health_result=$?
    echo ""
    
    echo "===================="
    if [ $container_result -eq 0 ] && [ $database_result -eq 0 ] && [ $health_result -eq 0 ]; then
        echo "✓ 所有检查通过"
        echo "===================="
        exit 0
    else
        echo "✗ 部分检查失败"
        echo "===================="
        exit 1
    fi
}

main
