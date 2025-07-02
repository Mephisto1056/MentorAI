# AI Mentor Tool - POC 设计文档

## 1. 项目概述

### 1.1 项目背景
AI导师工具是一个面向企业（特别是汽车经销商）的B2B销售培训平台，通过AI驱动的模拟销售场景帮助销售人员提升专业技能。

### 1.2 核心功能
- AI驱动的任务生成与定制
- 学员个性化练习对话
- AI + 导师双重反馈评估
- 后台数据监控与分析

## 2. 系统架构

### 2.1 整体架构
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用       │    │   后端API服务    │    │   AI服务层       │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (OpenAI/本地)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   数据库层       │
                       │   (MongoDB)     │
                       └─────────────────┘
```

### 2.2 技术栈选择

#### 前端技术栈
- **框架**: Next.js 14 (React 18)
- **UI组件库**: Ant Design / Material-UI
- **状态管理**: Zustand / Redux Toolkit
- **样式**: Tailwind CSS
- **图表**: Chart.js / Recharts
- **WebSocket**: Socket.io-client

#### 后端技术栈
- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: MongoDB + Mongoose
- **认证**: JWT + Passport.js
- **实时通信**: Socket.io
- **AI集成**: 阿里云通义千问 / OpenAI API
- **文件存储**: GridFS / AWS S3
- **缓存**: Redis

## 3. 数据库设计

### 3.1 核心数据模型

#### 用户模型 (Users)
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String, // 加密存储
  role: String, // 'admin', 'mentor', 'student'
  profile: {
    name: String,
    avatar: String,
    department: String,
    region: String,
    dealership: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### 任务模板模型 (TaskTemplates)
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  createdBy: ObjectId, // 导师ID
  configuration: {
    taskGoal: String, // 任务目标
    methodology: String, // 方法论
    customerDimensions: {
      personality: [String], // 客户性格
      profession: String, // 客户职业
      communicationStyle: String, // 沟通方式
      hobbies: [String], // 客户爱好
      gender: String,
      ageRange: String
    },
    productDimensions: {
      currentVehicle: String,
      interestedVehicle: String,
      focusPoints: [String] // 客户关注点
    },
    competitorDimensions: {
      currentVehicle: String,
      interestedVehicle: String,
      focusPoints: [String]
    },
    transactionDimensions: {
      negotiationStage: String,
      concerns: [String]
    }
  },
  evaluationCriteria: [{
    dimension: String, // 沟通维度、本品维度等
    criteria: [String] // 具体评判标准
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### 练习会话模型 (PracticeSessions)
```javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  taskTemplateId: ObjectId,
  sessionName: String,
  status: String, // 'in_progress', 'completed', 'submitted'
  conversation: [{
    role: String, // 'student', 'ai_customer'
    message: String,
    timestamp: Date,
    metadata: Object // 额外信息
  }],
  aiEvaluation: {
    overallScore: Number,
    dimensionScores: [{
      dimension: String,
      score: Number,
      feedback: String
    }],
    suggestions: [String],
    generatedAt: Date
  },
  mentorEvaluation: {
    overallScore: Number,
    feedback: String,
    evaluatedBy: ObjectId,
    evaluatedAt: Date
  },
  startedAt: Date,
  completedAt: Date,
  submittedAt: Date
}
```

#### 组织结构模型 (Organizations)
```javascript
{
  _id: ObjectId,
  name: String,
  type: String, // 'group', 'dealership', 'region'
  parentId: ObjectId, // 上级组织
  children: [ObjectId], // 下级组织
  managers: [ObjectId], // 管理员
  members: [ObjectId], // 成员
  settings: Object,
  createdAt: Date
}
```

## 4. API设计

### 4.1 认证相关API
```
POST /api/auth/login          # 用户登录
POST /api/auth/logout         # 用户登出
POST /api/auth/refresh        # 刷新token
GET  /api/auth/profile        # 获取用户信息
PUT  /api/auth/profile        # 更新用户信息
```

### 4.2 任务管理API
```
GET    /api/tasks/templates           # 获取任务模板列表
POST   /api/tasks/templates           # 创建任务模板
GET    /api/tasks/templates/:id       # 获取任务模板详情
PUT    /api/tasks/templates/:id       # 更新任务模板
DELETE /api/tasks/templates/:id       # 删除任务模板
GET    /api/tasks/dimensions          # 获取所有维度配置选项
```

### 4.3 练习会话API
```
GET    /api/sessions                  # 获取练习会话列表
POST   /api/sessions                  # 创建新的练习会话
GET    /api/sessions/:id              # 获取会话详情
PUT    /api/sessions/:id              # 更新会话状态
POST   /api/sessions/:id/messages     # 发送消息
POST   /api/sessions/:id/evaluate     # AI评估
POST   /api/sessions/:id/submit       # 提交会话
```

### 4.4 评估管理API
```
GET    /api/evaluations/pending       # 获取待评估会话
POST   /api/evaluations/:sessionId    # 导师评估
GET    /api/evaluations/history       # 评估历史
```

### 4.5 数据分析API
```
GET    /api/analytics/dashboard       # 仪表盘数据
GET    /api/analytics/completion      # 完成率统计
GET    /api/analytics/performance     # 绩效分析
GET    /api/analytics/trends          # 趋势分析
POST   /api/analytics/reports         # 生成报告
```

## 5. 前端架构设计

### 5.1 页面结构
```
src/
├── components/           # 通用组件
│   ├── Layout/          # 布局组件
│   ├── Forms/           # 表单组件
│   ├── Charts/          # 图表组件
│   └── Common/          # 通用组件
├── pages/               # 页面组件
│   ├── auth/            # 认证页面
│   ├── dashboard/       # 仪表盘
│   ├── tasks/           # 任务管理
│   ├── practice/        # 练习页面
│   └── analytics/       # 数据分析
├── hooks/               # 自定义Hooks
├── services/            # API服务
├── stores/              # 状态管理
├── utils/               # 工具函数
└── types/               # TypeScript类型定义
```

### 5.2 核心页面设计

#### 任务创建页面 (Task Creation)
- 多级下拉选择器组件
- 实时预览生成的prompt
- 表单验证和保存功能

#### 练习对话页面 (Practice Chat)
- 聊天界面组件
- WebSocket实时通信
- 消息历史记录
- 会话状态管理

#### 数据分析仪表盘 (Analytics Dashboard)
- 多维度数据展示
- 交互式图表
- 筛选和排序功能
- 导出报告功能

## 6. 后端架构设计

### 6.1 项目结构
```
src/
├── controllers/         # 控制器
├── models/             # 数据模型
├── routes/             # 路由定义
├── middleware/         # 中间件
├── services/           # 业务逻辑服务
│   ├── aiService.js    # AI服务
│   ├── authService.js  # 认证服务
│   └── analyticsService.js # 分析服务
├── utils/              # 工具函数
├── config/             # 配置文件
└── app.js              # 应用入口
```

### 6.2 核心服务设计

#### AI服务 (aiService.js)
```javascript
class AIService {
  // 生成客户角色prompt
  async generateCustomerPrompt(taskConfig) {}
  
  // AI客户对话响应
  async generateCustomerResponse(conversation, customerProfile) {}
  
  // 评估学员表现
  async evaluatePerformance(conversation, criteria) {}
  
  // 生成分析报告
  async generateAnalyticsReport(data) {}
}
```

#### WebSocket服务
```javascript
// 实时对话处理
io.on('connection', (socket) => {
  socket.on('join_session', (sessionId) => {});
  socket.on('send_message', async (data) => {});
  socket.on('request_ai_response', async (data) => {});
});
```

## 7. 实现计划

### 7.1 第一阶段 - 基础框架 (2周)
- [x] 项目初始化和环境配置
- [ ] 数据库设计和模型创建
- [ ] 基础认证系统
- [ ] 前端基础布局和路由

### 7.2 第二阶段 - 核心功能 (3周)
- [ ] 任务模板创建功能
- [ ] 练习会话基础功能
- [ ] AI服务集成
- [ ] 实时对话功能

### 7.3 第三阶段 - 评估系统 (2周)
- [ ] AI自动评估功能
- [ ] 导师评估界面
- [ ] 评估结果展示

### 7.4 第四阶段 - 数据分析 (2周)
- [ ] 数据统计和分析
- [ ] 仪表盘开发
- [ ] 报告生成功能

### 7.5 第五阶段 - 优化和测试 (1周)
- [ ] 性能优化
- [ ] 用户体验优化
- [ ] 系统测试和部署

## 8. 技术难点和解决方案

### 8.1 AI对话一致性
**问题**: 确保AI客户角色在整个对话过程中保持一致的性格和背景
**解决方案**: 
- 使用conversation memory机制
- 在每次AI调用时包含完整的角色设定和对话历史
- 实现角色一致性检查机制

### 8.2 实时性能优化
**问题**: 大量并发对话会话的性能问题
**解决方案**:
- 使用Redis缓存活跃会话
- 实现连接池管理
- 消息队列处理AI请求

### 8.3 评估准确性
**问题**: AI评估的准确性和客观性
**解决方案**:
- 多维度评估模型
- 评估结果校准机制
- 人工评估作为基准对比

## 9. 部署架构

### 9.1 开发环境
```
Docker Compose:
- Next.js前端服务
- Express.js后端服务
- MongoDB数据库
- Redis缓存
```

### 9.2 生产环境
```
云服务架构:
- 前端: Vercel/Netlify
- 后端: AWS EC2/阿里云ECS
- 数据库: MongoDB Atlas
- 缓存: Redis Cloud
- CDN: CloudFlare
```

## 10. 安全考虑

### 10.1 数据安全
- 用户密码加密存储
- API接口JWT认证
- 敏感数据传输加密
- 数据库访问权限控制

### 10.2 业务安全
- 会话数据隔离
- 组织权限管理
- API访问频率限制
- 审计日志记录

## 11. 监控和维护

### 11.1 系统监控
- 应用性能监控(APM)
- 数据库性能监控
- API响应时间监控
- 错误日志收集

### 11.2 业务监控
- 用户活跃度统计
- 功能使用情况分析
- AI服务调用统计
- 系统资源使用监控

---

## 总结

本POC设计文档提供了AI导师工具的完整技术实现方案，采用现代化的Node.js全栈技术，确保系统的可扩展性、可维护性和高性能。通过分阶段的实现计划，可以逐步构建出一个功能完整、用户体验良好的AI销售培训平台。
