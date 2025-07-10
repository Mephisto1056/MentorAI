# AI对话集成实现指南

## 🎯 已实现功能

我们已经成功实现了真实的AI对话集成，使用阿里云通义千问API，对话的prompt由任务生成器界面生成。

### ✅ 完成的功能

1. **前端AI对话界面** (`/practice-chat`)
   - WebSocket实时通信
   - 真实AI响应集成
   - 任务配置参数传递
   - 降级处理机制

2. **后端AI服务** (`aiService.js`)
   - 阿里云通义千问API集成
   - OpenAI备用支持
   - 客户角色Prompt生成
   - 对话上下文管理

3. **新增API端点**
   - `POST /api/ai/generate-response` - 直接AI响应生成
   - `POST /api/sessions` - 支持taskConfig的会话创建

4. **数据模型扩展**
   - PracticeSession支持taskConfig和aiPrompt字段
   - 灵活的会话创建方式

## 🚀 启动步骤

### 1. 启动后端服务
```bash
cd mentor-ai-tool/backend
npm run dev
```

### 2. 启动前端服务
```bash
cd mentor-ai-tool/frontend
npm run dev
```

### 3. 测试AI集成（可选）
```bash
# 在项目根目录运行
node test-ai-integration.js
```

## 🎮 使用流程

### 方式一：完整流程
1. 访问 http://localhost:3000/task-generator
2. 配置客户维度、本品维度、竞品维度等
3. 点击"生成AI角色Prompt"
4. 点击"开始对话练习"
5. 在对话界面与AI客户进行真实对话

### 方式二：直接对话
1. 访问 http://localhost:3000/practice-chat
2. 系统会使用默认配置启动对话
3. 直接开始与AI客户对话

## 🔧 技术实现

### 前端技术栈
- **Next.js 15** + React 19
- **Socket.io-client** - WebSocket实时通信
- **Axios** - HTTP请求
- **Tailwind CSS** - 样式

### 后端技术栈
- **Express.js** - Web框架
- **Socket.io** - WebSocket服务
- **MongoDB + Mongoose** - 数据存储
- **阿里云通义千问** - AI服务

### AI服务配置
```env
AI_PROVIDER=alicloud
ALICLOUD_API_KEY=sk-63e038d2b186462eab6af00494aecc78
ALICLOUD_BASE_URL=https://dashscope.aliyuncs.com/api/v1
ALICLOUD_MODEL=qwen-turbo
```

## 📋 API接口

### 1. AI响应生成
```http
POST /api/ai/generate-response
Content-Type: application/json

{
  "message": "用户消息",
  "taskConfig": { /* 任务配置 */ },
  "aiPrompt": "AI角色设定",
  "conversationHistory": [ /* 对话历史 */ ]
}
```

### 2. 创建练习会话
```http
POST /api/sessions
Content-Type: application/json

{
  "taskConfig": { /* 任务配置 */ },
  "aiPrompt": "AI角色设定",
  "customerProfile": { /* 客户画像 */ },
  "sessionName": "会话名称"
}
```

## 🔄 对话流程

1. **会话初始化**
   - 前端从URL参数获取taskConfig和aiPrompt
   - 创建WebSocket连接
   - 调用后端创建会话

2. **消息发送**
   - 用户输入消息
   - 通过WebSocket发送到后端
   - 后端保存消息到数据库

3. **AI响应生成**
   - 后端调用aiService.generateCustomerResponse()
   - 使用阿里云API生成回复
   - 通过WebSocket返回给前端

4. **降级处理**
   - WebSocket连接失败时使用HTTP API
   - AI服务失败时使用预设回复
   - 确保用户体验连续性

## 🎨 界面特性

### 任务生成器 (`/task-generator`)
- 多维度配置选项
- 一键随机生成
- 实时Prompt预览
- 直接跳转到对话

### 对话界面 (`/practice-chat`)
- 实时消息显示
- 客户信息面板
- 实时提示和建议
- 快速回复功能
- 对话统计

## 🔍 调试和监控

### 日志查看
```bash
# 后端日志
tail -f mentor-ai-tool/backend/logs/combined.log

# 前端控制台
# 打开浏览器开发者工具查看WebSocket连接状态
```

### 健康检查
```bash
curl http://localhost:6100/health
```

## 🚨 故障排除

### 常见问题

1. **WebSocket连接失败**
   - 检查后端服务是否启动
   - 确认端口5000未被占用
   - 查看浏览器控制台错误

2. **AI响应失败**
   - 检查阿里云API密钥是否正确
   - 确认网络连接正常
   - 查看后端日志错误信息

3. **数据库连接问题**
   - 确认MongoDB服务运行
   - 检查连接字符串配置
   - 查看数据库日志

### 降级机制
- WebSocket失败 → HTTP API
- 阿里云API失败 → OpenAI API（如配置）
- AI服务完全失败 → 预设回复

## 🎯 下一步优化

1. **用户认证系统**
   - 实现完整的登录注册
   - 会话权限管理

2. **AI评估功能**
   - 自动评估学员表现
   - 多维度评分

3. **数据分析面板**
   - 实时数据展示
   - 学习进度跟踪

4. **移动端适配**
   - 响应式设计优化
   - 移动端专用界面

## 📞 技术支持

如有问题，请检查：
1. 环境配置是否正确
2. 依赖包是否安装完整
3. API密钥是否有效
4. 网络连接是否正常

---

🎉 **恭喜！您已经成功实现了AI导师工具的真实AI对话功能！**
