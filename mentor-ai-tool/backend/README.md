# AI Mentor Tool - Backend

AI导师工具后端服务，基于Node.js和Express.js构建，提供AI驱动的销售培训平台。

## 功能特性

- 🔐 JWT身份认证和授权
- 📝 任务模板管理
- 💬 实时对话练习
- 🤖 AI客户模拟和评估
- 📊 数据分析和报告
- 🔄 WebSocket实时通信

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **认证**: JWT + Passport.js
- **实时通信**: Socket.io
- **AI集成**: OpenAI API
- **日志**: Winston
- **安全**: Helmet, CORS, Rate Limiting

## 项目结构

```
src/
├── config/          # 配置文件
│   └── database.js  # 数据库连接配置
├── controllers/     # 控制器（预留）
├── middleware/      # 中间件
│   ├── auth.js      # 认证中间件
│   └── errorHandler.js # 错误处理中间件
├── models/          # 数据模型
│   ├── User.js      # 用户模型
│   ├── TaskTemplate.js # 任务模板模型
│   └── PracticeSession.js # 练习会话模型
├── routes/          # 路由
│   ├── auth.js      # 认证路由
│   ├── tasks.js     # 任务管理路由
│   ├── sessions.js  # 会话管理路由
│   ├── evaluations.js # 评估管理路由
│   └── analytics.js # 数据分析路由
├── services/        # 业务服务
│   ├── aiService.js # AI服务
│   └── socketService.js # WebSocket服务
├── utils/           # 工具函数
│   └── logger.js    # 日志工具
└── app.js           # 应用入口
```

## 快速开始

### 1. 环境要求

- Node.js 18+
- MongoDB 4.4+
- npm 或 yarn

### 2. 安装依赖

```bash
npm install
```

### 3. 环境配置

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置以下变量：

```env
# 服务器配置
NODE_ENV=development
PORT=5000

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/mentor-ai

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=30d

# AI服务配置
AI_PROVIDER=alicloud

# OpenAI配置 (备用)
OPENAI_API_KEY=your-openai-api-key-here

# 阿里云配置 (主要)
ALICLOUD_API_KEY=your-alicloud-api-key-here
ALICLOUD_BASE_URL=https://dashscope.aliyuncs.com/api/v1
ALICLOUD_MODEL=qwen-turbo

# 前端URL
FRONTEND_URL=http://localhost:3000

# 日志级别
LOG_LEVEL=info
```

### 4. 启动服务

开发模式（热重载）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

## API文档

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息
- `PUT /api/auth/profile` - 更新用户信息
- `POST /api/auth/logout` - 用户登出

### 任务管理接口

- `GET /api/tasks/templates` - 获取任务模板列表
- `POST /api/tasks/templates` - 创建任务模板
- `GET /api/tasks/templates/:id` - 获取任务模板详情
- `PUT /api/tasks/templates/:id` - 更新任务模板
- `DELETE /api/tasks/templates/:id` - 删除任务模板
- `GET /api/tasks/dimensions` - 获取任务维度配置

### 练习会话接口

- `GET /api/sessions` - 获取练习会话列表
- `POST /api/sessions` - 创建新的练习会话
- `GET /api/sessions/:id` - 获取会话详情
- `POST /api/sessions/:id/messages` - 添加消息到对话
- `POST /api/sessions/:id/submit` - 提交会话

### 评估管理接口

- `GET /api/evaluations/pending` - 获取待评估会话
- `POST /api/evaluations/:sessionId` - 提交导师评估
- `GET /api/evaluations/history` - 获取评估历史

### 数据分析接口

- `GET /api/analytics/dashboard` - 获取仪表盘数据
- `GET /api/analytics/completion` - 获取完成率统计
- `GET /api/analytics/performance` - 获取绩效分析
- `GET /api/analytics/trends` - 获取趋势分析

## WebSocket事件

### 客户端发送事件

- `join_session` - 加入练习会话
- `send_message` - 发送消息
- `request_ai_response` - 请求AI响应
- `request_evaluation` - 请求AI评估

### 服务端发送事件

- `joined_session` - 成功加入会话
- `new_message` - 新消息通知
- `evaluation_complete` - 评估完成
- `error` - 错误通知

## 数据模型

### 用户角色

- `admin` - 系统管理员
- `mentor` - 销售导师
- `student` - 学员

### 会话状态

- `in_progress` - 进行中
- `completed` - 已完成
- `submitted` - 已提交
- `evaluated` - 已评估

### 评估维度

- 沟通维度
- 本品维度
- 竞品维度
- 客户信息获取维度
- 方法论匹配度

## 开发指南

### 添加新的API端点

1. 在相应的路由文件中添加路由定义
2. 实现控制器逻辑
3. 添加必要的中间件（认证、授权等）
4. 更新API文档

### 添加新的数据模型

1. 在 `models/` 目录下创建模型文件
2. 定义Mongoose schema
3. 添加必要的索引和方法
4. 在相关路由中引用模型

### 扩展AI功能

1. 在 `aiService.js` 中添加新的方法
2. 配置相应的prompt模板
3. 处理API响应和错误
4. 在路由或WebSocket事件中调用

## 部署

### Docker部署

```bash
# 构建镜像
docker build -t mentor-ai-backend .

# 运行容器
docker run -p 5000:5000 --env-file .env mentor-ai-backend
```

### 生产环境配置

1. 设置环境变量 `NODE_ENV=production`
2. 配置生产数据库连接
3. 设置强密码的JWT密钥
4. 配置HTTPS和安全头
5. 设置日志轮转和监控

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MongoDB服务是否运行
   - 验证连接字符串格式
   - 确认网络连接

2. **JWT认证失败**
   - 检查JWT_SECRET配置
   - 验证token格式和有效期
   - 确认请求头格式

3. **AI服务调用失败**
   - 验证OpenAI API密钥
   - 检查网络连接
   - 查看API配额和限制

### 日志查看

开发环境日志会输出到控制台，生产环境日志保存在 `logs/` 目录：

- `logs/error.log` - 错误日志
- `logs/combined.log` - 综合日志

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

ISC License
