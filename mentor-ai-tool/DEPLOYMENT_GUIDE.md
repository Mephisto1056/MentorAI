# MentorAI 部署配置指南

## 概述

本项目已经修复了所有硬编码的URL问题，现在支持通过环境变量进行配置，可以轻松部署到不同的环境中。

## 环境变量配置

### 前端环境变量

前端使用 `config.ts` 中的默认配置 `http://localhost:6100`。如需自定义API地址，可通过环境变量设置：

```bash
# 方式1：设置环境变量（推荐）
export NEXT_PUBLIC_API_BASE_URL=https://your-domain.com

# 方式2：创建 .env.local 文件（可选）
# 在 mentor-ai-tool/frontend/.env.local 中：
NEXT_PUBLIC_API_BASE_URL=https://your-domain.com

# 示例配置：
# 本地开发环境（默认）
# NEXT_PUBLIC_API_BASE_URL=http://localhost:6100

# 生产环境（有域名）
# NEXT_PUBLIC_API_BASE_URL=https://mentorai.example.com

# 生产环境（仅IP）
# NEXT_PUBLIC_API_BASE_URL=http://123.456.789.123:6100

# 使用Nginx反向代理
# NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/api
```

### 后端环境变量 (.env)

在 `mentor-ai-tool/backend/.env` 文件中配置：

```bash
# 服务器端口
PORT=6100

# MongoDB数据库连接
MONGODB_URI=mongodb://localhost:27017/mentor-ai
# 或远程数据库
# MONGODB_URI=mongodb://your-db-server:27017/mentor-ai

# JWT密钥
JWT_SECRET=your-jwt-secret-key

# AI服务配置
OPENAI_API_KEY=your-openai-api-key
OPENAI_BASE_URL=https://api.openai.com/v1

# 阿里云语音服务配置
ALICLOUD_ACCESS_KEY_ID=your-access-key-id
ALICLOUD_ACCESS_KEY_SECRET=your-access-key-secret
ALICLOUD_REGION=cn-shanghai

# 其他配置
NODE_ENV=production
```

## 部署步骤

### 快速部署（推荐）

我们提供了一个自动化部署脚本，可以快速配置外网访问：

```bash
# 克隆代码到服务器
git clone https://github.com/your-repo/MentorAI.git
cd MentorAI/mentor-ai-tool

# 使用部署脚本自动配置
./deploy-external.sh [您的服务器IP或域名]

# 示例：
./deploy-external.sh 123.456.789.123
# 或
./deploy-external.sh your-domain.com
```

脚本会自动：
- 配置后端的环境变量
- 提供前端环境变量设置说明
- 提供部署命令和验证URL
- 显示防火墙配置提示

### 手动部署

如果您需要手动配置，请按以下步骤操作：

#### 1. 服务器环境准备

确保服务器已安装：
- Node.js (v16+)
- MongoDB
- PM2 (用于进程管理)

#### 2. 代码部署

```bash
# 克隆代码到服务器
git clone https://github.com/your-repo/MentorAI.git
cd MentorAI/mentor-ai-tool

# 安装依赖
cd backend && npm install
cd ../frontend && npm install
```

#### 3. 环境变量配置

```bash
# 配置后端环境变量
cd backend
cp .env.example .env
# 编辑 .env 文件，设置正确的配置

# 配置前端环境变量（可选）
cd ../frontend
# 如需自定义API地址，可创建 .env.local 文件或设置环境变量
# export NEXT_PUBLIC_API_BASE_URL=https://your-domain.com
```

### 4. 构建和启动

```bash
# 构建前端
cd frontend
npm run build

# 启动后端服务
cd ../backend
pm2 start src/app.js --name "mentor-ai-backend"

# 启动前端服务
cd ../frontend
pm2 start npm --name "mentor-ai-frontend" -- start
```

### 5. 使用Nginx反向代理（推荐）

创建Nginx配置文件：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API接口
    location /api {
        proxy_pass http://localhost:6100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.IO支持
    location /socket.io/ {
        proxy_pass http://localhost:6100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 配置说明

### API配置文件

项目使用统一的API配置文件 `frontend/src/config.ts`：

```typescript
const config = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6100',
};

export const getApiUrl = (path: string) => {
  return `${config.BASE_URL}${path}`;
};
```

### 已修复的文件

以下文件已经修复了硬编码URL问题：

1. `frontend/src/app/practice-chat/page.tsx` - 练习聊天页面
2. `frontend/src/app/task-generator/page.tsx` - 任务生成页面
3. `frontend/src/app/mentor-evaluation/page.tsx` - 导师评估页面
4. `frontend/src/app/evaluation-result/page.tsx` - 评估结果页面

所有页面现在都使用 `getApiUrl()` 函数来构建API请求URL。

## 常见问题

### 1. 跨域问题

如果遇到跨域问题，确保后端已正确配置CORS：

```javascript
// backend/src/app.js
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### 2. Socket.IO连接问题

确保Socket.IO配置正确：

```javascript
// 前端连接
const socket = io(getApiUrl(''), {
  transports: ['websocket', 'polling']
});
```

### 3. 环境变量不生效

- 前端环境变量必须以 `NEXT_PUBLIC_` 开头才能在浏览器中访问
- 修改环境变量后需要重启服务
- 前端默认使用 `config.ts` 中的配置，无需 `.env.local` 文件

## 外网访问配置

### 方案一：直接使用IP地址和端口

如果您的服务器有公网IP，可以直接配置：

```bash
# 前端环境变量（可选）
export NEXT_PUBLIC_API_BASE_URL=http://123.456.789.123:6100

# 后端环境变量 (.env)
PORT=6100
FRONTEND_URL=http://123.456.789.123:3000
```

**注意事项：**
- 确保服务器防火墙开放了3000和6100端口
- 如果使用云服务器，需要在安全组中开放这些端口

### 方案二：使用域名（推荐）

1. 购买域名并解析到服务器IP
2. 配置Nginx反向代理
3. 申请SSL证书（推荐使用Let's Encrypt）

```bash
# 前端环境变量（可选）
export NEXT_PUBLIC_API_BASE_URL=https://your-domain.com

# 后端环境变量 (.env)
PORT=6100
FRONTEND_URL=https://your-domain.com
```

### 方案三：使用子路径部署

如果需要在子路径下部署（如 `/mentorai`），需要额外配置：

```bash
# 前端环境变量
export NEXT_PUBLIC_API_BASE_URL=https://your-domain.com/mentorai/api
export NEXT_PUBLIC_BASE_PATH=/mentorai

# Next.js配置 (next.config.ts)
const nextConfig = {
  basePath: '/mentorai',
  assetPrefix: '/mentorai',
}
```

### 防火墙配置

确保服务器防火墙开放必要端口：

```bash
# Ubuntu/Debian
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # Next.js (如果直接访问)
sudo ufw allow 6100  # 后端API (如果直接访问)

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=6100/tcp
sudo firewall-cmd --reload
```

### 云服务器安全组配置

如果使用阿里云、腾讯云等云服务器，需要在控制台配置安全组：

- 入方向规则：
  - 协议：TCP
  - 端口：80, 443, 3000, 6100
  - 源：0.0.0.0/0

## 验证部署

部署完成后，访问以下URL验证：

1. 前端首页：`http://your-domain.com` 或 `http://your-server-ip:3000`
2. API健康检查：`http://your-domain.com/api/health` 或 `http://your-server-ip:6100/health`
3. 练习聊天功能：`http://your-domain.com/practice-chat`

## 监控和日志

使用PM2查看服务状态：

```bash
# 查看所有进程
pm2 list

# 查看日志
pm2 logs mentor-ai-backend
pm2 logs mentor-ai-frontend

# 重启服务
pm2 restart mentor-ai-backend
pm2 restart mentor-ai-frontend
```

## 安全建议

1. 使用HTTPS（配置SSL证书）
2. 设置强密码和JWT密钥
3. 配置防火墙规则
4. 定期更新依赖包
5. 备份数据库

## 技术支持

如果在部署过程中遇到问题，请检查：

1. 环境变量配置是否正确
2. 服务是否正常启动
3. 网络连接是否正常
4. 日志文件中的错误信息
