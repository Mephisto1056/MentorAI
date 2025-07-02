# 阿里云通义千问API配置指南

本文档介绍如何配置和使用阿里云通义千问API作为AI Mentor Tool的AI服务提供商。

## 1. 获取阿里云API密钥

### 1.1 注册阿里云账号
1. 访问 [阿里云官网](https://www.aliyun.com/)
2. 注册并完成实名认证

### 1.2 开通DashScope服务
1. 登录阿里云控制台
2. 搜索并进入"DashScope"服务
3. 开通服务并获取API Key

### 1.3 获取API密钥
1. 在DashScope控制台中找到"API Key管理"
2. 创建新的API Key
3. 复制并保存API Key（请妥善保管）

## 2. 配置环境变量

在项目的 `.env` 文件中配置以下变量：

```env
# AI服务配置
AI_PROVIDER=alicloud

# 阿里云配置
ALICLOUD_API_KEY=your-alicloud-api-key-here
ALICLOUD_BASE_URL=https://dashscope.aliyuncs.com/api/v1
ALICLOUD_MODEL=qwen-turbo
```

### 可用模型列表

| 模型名称 | 描述 | 适用场景 |
|---------|------|----------|
| qwen-turbo | 通义千问超大规模语言模型，支持中文英文等不同语言输入 | 通用对话、文本生成 |
| qwen-plus | 通义千问超大规模语言模型增强版 | 复杂推理、专业对话 |
| qwen-max | 通义千问超大规模语言模型旗舰版 | 高质量文本生成 |
| qwen-max-longcontext | 支持长文本的通义千问模型 | 长文档处理 |

## 3. API调用示例

### 3.1 基本对话
```javascript
const response = await aiService.generateResponse([
  { role: 'user', content: '你好，我想了解保时捷911' }
], '你是一位专业的汽车销售顾问');
```

### 3.2 客户模拟
```javascript
const customerResponse = await aiService.generateCustomerResponse(
  conversation,
  customerProfile,
  taskConfig
);
```

### 3.3 性能评估
```javascript
const evaluation = await aiService.evaluatePerformance(
  conversation,
  evaluationCriteria
);
```

## 4. API限制和配额

### 4.1 调用频率限制
- 免费版：每分钟最多60次调用
- 付费版：根据购买的套餐包确定

### 4.2 Token限制
- 单次请求最大输入：6000 tokens
- 单次请求最大输出：2000 tokens

### 4.3 并发限制
- 免费版：最多3个并发请求
- 付费版：根据套餐包确定

## 5. 错误处理

### 5.1 常见错误码

| 错误码 | 描述 | 解决方案 |
|--------|------|----------|
| 400 | 请求参数错误 | 检查请求格式和参数 |
| 401 | 认证失败 | 检查API Key是否正确 |
| 403 | 权限不足 | 检查账户余额和服务状态 |
| 429 | 请求频率超限 | 降低请求频率或升级套餐 |
| 500 | 服务器内部错误 | 稍后重试或联系技术支持 |

### 5.2 降级策略
系统支持自动降级到OpenAI API：
1. 当阿里云API调用失败时，自动尝试OpenAI API
2. 如果两个服务都不可用，返回预设的默认响应

## 6. 性能优化

### 6.1 请求优化
- 合理设置temperature参数（0.7推荐）
- 控制max_tokens避免不必要的长回复
- 使用合适的模型（qwen-turbo适合大多数场景）

### 6.2 缓存策略
- 对相似的prompt进行缓存
- 缓存常用的评估结果
- 实现请求去重机制

### 6.3 监控和日志
- 记录API调用次数和响应时间
- 监控错误率和成功率
- 设置告警机制

## 7. 安全最佳实践

### 7.1 API密钥管理
- 不要在代码中硬编码API密钥
- 使用环境变量存储敏感信息
- 定期轮换API密钥
- 限制API密钥的访问权限

### 7.2 请求安全
- 验证用户输入，防止注入攻击
- 实现请求频率限制
- 记录和监控异常请求

### 7.3 数据隐私
- 不要发送敏感个人信息到API
- 实现数据脱敏机制
- 遵守相关法律法规

## 8. 故障排除

### 8.1 连接问题
```bash
# 测试网络连接
curl -X POST https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

### 8.2 认证问题
- 检查API Key格式是否正确
- 确认API Key是否已激活
- 验证账户状态和余额

### 8.3 调试模式
在开发环境中启用详细日志：
```env
LOG_LEVEL=debug
```

## 9. 成本控制

### 9.1 监控用量
- 定期检查API调用统计
- 设置用量告警
- 分析调用模式优化成本

### 9.2 优化策略
- 使用更经济的模型（如qwen-turbo）
- 减少不必要的API调用
- 实现智能缓存机制
- 批量处理请求

## 10. 技术支持

### 10.1 官方文档
- [DashScope API文档](https://help.aliyun.com/zh/dashscope/)
- [通义千问模型介绍](https://help.aliyun.com/zh/dashscope/developer-reference/api-details)

### 10.2 社区支持
- 阿里云开发者社区
- GitHub Issues
- 技术交流群

### 10.3 联系方式
如遇到技术问题，可通过以下方式获取支持：
- 阿里云工单系统
- 官方技术支持热线
- 在线客服
