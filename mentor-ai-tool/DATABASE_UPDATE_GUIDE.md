# 数据库更新指南

## 🚨 重要：服务器部署时需要手动更新数据库

当你将代码部署到服务器时，需要手动运行数据库更新脚本来为现有会话添加 `aiEvaluationStatus` 字段。

## 📋 更新步骤

### 1. 上传代码到服务器
```bash
# 确保所有新代码都已上传，包括：
# - backend/src/models/PracticeSession.js (新增aiEvaluationStatus字段)
# - backend/fix-ai-evaluation-status.js (数据库更新脚本)
# - frontend/src/app/mentor-evaluation/page.tsx (弹窗功能)
```

### 2. 在服务器上运行数据库更新脚本
```bash
# SSH到服务器
ssh your-server

# 进入项目目录
cd /path/to/your/mentor-ai-tool/backend

# 运行数据库更新脚本
node fix-ai-evaluation-status.js
```

### 3. 预期输出
```
MongoDB Connected: your-mongodb-host
开始修复AI评估状态字段...
找到 X 个需要修复的会话
会话 xxx: 已有AI评估 -> completed
会话 xxx: 已提交但无AI评估 -> in_progress  
会话 xxx: 默认状态 -> pending
✅ 成功更新了 X 个会话的AI评估状态

📊 AI评估状态分布:
  completed: X 个会话
  pending: X 个会话
  in_progress: X 个会话

🎉 修复完成！
```

### 4. 重启服务
```bash
# 重启后端服务以加载新的数据模型
pm2 restart mentor-ai-backend
# 或者如果使用其他进程管理器
systemctl restart mentor-ai-backend
```

## 🔍 验证更新是否成功

### 方法1：检查API响应
```bash
# 测试AI评估状态API
curl http://your-server/api/sessions/SESSION_ID/ai-evaluation-status

# 应该返回类似：
{
  "success": true,
  "data": {
    "sessionId": "...",
    "aiEvaluationStatus": "completed", // 不再是 "unknown"
    "hasAiEvaluation": true,
    "overallScore": 85
  }
}
```

### 方法2：检查前端功能
1. 打开mentor-evaluation页面
2. 选择一个会话
3. 查看控制台日志，应该看到：
   ```
   AI评估状态检查: pending -> completed
   ```
   而不是：
   ```
   AI评估状态检查: unknown -> unknown
   ```

## ⚠️ 注意事项

### 1. 备份数据库（推荐）
```bash
# 在运行更新脚本前备份数据库
mongodump --db mentor-ai --out /backup/mentor-ai-$(date +%Y%m%d)
```

### 2. 检查MongoDB连接
确保脚本中的MongoDB连接字符串正确：
```javascript
// 在 fix-ai-evaluation-status.js 中检查这行
const conn = await mongoose.connect('mongodb://localhost:27017/mentor-ai', {
```

如果你的MongoDB在不同的主机或端口，需要修改连接字符串。

### 3. 权限检查
确保运行脚本的用户有MongoDB的读写权限。

## 🚀 为什么需要手动更新？

1. **数据安全**：自动数据库迁移可能有风险，手动执行更安全
2. **控制时机**：你可以选择合适的维护时间窗口执行
3. **验证机会**：可以在更新前备份，更新后验证
4. **一次性操作**：这个更新只需要执行一次

## 📞 如果遇到问题

1. **脚本执行失败**：检查MongoDB连接和权限
2. **找不到会话**：确认数据库名称和集合名称正确
3. **权限错误**：确保用户有数据库写权限
4. **连接超时**：检查网络和MongoDB服务状态

更新完成后，弹窗功能就会正常工作了！🎉
