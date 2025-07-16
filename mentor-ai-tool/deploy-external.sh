#!/bin/bash

# MentorAI 外网部署配置脚本
# 使用方法: ./deploy-external.sh [服务器IP或域名]

set -e

echo "🚀 MentorAI 外网部署配置脚本"
echo "================================"

# 检查参数
if [ $# -eq 0 ]; then
    echo "❌ 请提供服务器IP地址或域名"
    echo "使用方法: ./deploy-external.sh [服务器IP或域名]"
    echo "示例: ./deploy-external.sh 123.456.789.123"
    echo "示例: ./deploy-external.sh your-domain.com"
    exit 1
fi

SERVER_ADDRESS=$1
PROTOCOL="http"

# 检查是否为域名（包含字母）
if [[ $SERVER_ADDRESS =~ [a-zA-Z] ]]; then
    echo "🌐 检测到域名: $SERVER_ADDRESS"
    # 如果是localhost，默认使用HTTP
    if [[ $SERVER_ADDRESS == "localhost" ]]; then
        echo "📍 本地开发环境，使用HTTP协议"
    else
        read -p "是否使用HTTPS? (y/n): " use_https
        if [[ $use_https =~ ^[Yy]$ ]]; then
            PROTOCOL="https"
        fi
    fi
else
    echo "🖥️  检测到IP地址: $SERVER_ADDRESS"
fi

FRONTEND_URL="${PROTOCOL}://${SERVER_ADDRESS}:3000"
BACKEND_URL="${PROTOCOL}://${SERVER_ADDRESS}:6100"

echo ""
echo "📋 配置信息:"
echo "   前端地址: $FRONTEND_URL"
echo "   后端地址: $BACKEND_URL"
echo ""

# 配置前端环境变量
echo "⚙️  配置前端环境变量..."
echo "ℹ️  前端使用 config.ts 中的默认配置，如需自定义API地址，请设置环境变量:"
echo "   export NEXT_PUBLIC_API_BASE_URL=$BACKEND_URL"
echo "✅ 前端配置说明已显示"

# 配置后端环境变量
echo "⚙️  配置后端环境变量..."

# 检查是否存在.env文件
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "📄 已从.env.example创建.env文件"
    else
        touch backend/.env
        echo "📄 已创建新的.env文件"
    fi
fi

# 更新或添加FRONTEND_URL配置
if grep -q "FRONTEND_URL=" backend/.env; then
    sed -i.bak "s|FRONTEND_URL=.*|FRONTEND_URL=$FRONTEND_URL|" backend/.env
    echo "🔄 已更新FRONTEND_URL配置"
else
    echo "" >> backend/.env
    echo "# 外网访问配置" >> backend/.env
    echo "FRONTEND_URL=$FRONTEND_URL" >> backend/.env
    echo "➕ 已添加FRONTEND_URL配置"
fi

# 更新或添加NODE_ENV配置
if grep -q "NODE_ENV=" backend/.env; then
    sed -i.bak "s|NODE_ENV=.*|NODE_ENV=production|" backend/.env
else
    echo "NODE_ENV=production" >> backend/.env
fi

echo "✅ 后端环境变量已配置: backend/.env"

# 显示防火墙配置提示
echo ""
echo "🔥 防火墙配置提示:"
echo "   请确保以下端口已开放:"
echo "   - 22 (SSH)"
echo "   - 80 (HTTP)"
if [[ $PROTOCOL == "https" ]]; then
    echo "   - 443 (HTTPS)"
fi
echo "   - 3000 (Next.js前端)"
echo "   - 6100 (Node.js后端)"
echo ""

# 显示部署命令
echo "🚀 部署命令:"
echo ""
echo "1. 安装依赖:"
echo "   cd backend && npm install"
echo "   cd ../frontend && npm install"
echo ""
echo "2. 构建前端:"
echo "   cd frontend && npm run build"
echo ""
echo "3. 启动服务:"
echo "   cd ../backend && pm2 start src/app.js --name mentor-ai-backend"
echo "   cd ../frontend && pm2 start npm --name mentor-ai-frontend -- start"
echo ""

# 显示验证URL
echo "🔍 部署验证:"
echo "   前端首页: $FRONTEND_URL"
echo "   API健康检查: $BACKEND_URL/health"
echo "   练习聊天: $FRONTEND_URL/practice-chat"
echo ""

# 显示Nginx配置建议
if [[ $PROTOCOL == "https" ]] || [[ $SERVER_ADDRESS =~ [a-zA-Z] ]]; then
    echo "🌐 Nginx反向代理配置建议:"
    echo "   请参考 DEPLOYMENT_GUIDE.md 中的Nginx配置示例"
    echo "   配置文件位置: /etc/nginx/sites-available/$SERVER_ADDRESS"
    echo ""
fi

echo "✨ 配置完成！"
echo "📖 详细部署说明请查看: DEPLOYMENT_GUIDE.md"
