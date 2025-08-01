# AI导师工具 - 反馈与评估机制测试指南

## 系统概述

本文档描述了如何测试AI导师工具中新实现的"反馈与评估机制"，该机制实现了sysdesign.md中描述的AI + Mentor双重反馈评估系统。

## 功能特性

### 1. AI自动评估
- **触发时机**: 学员提交练习会话时自动执行
- **评估标准**: 严格按照14个评估细则进行分析
- **评估维度**: 
  - 沟通维度（4个细则）
  - 本品维度（3个细则）
  - 竞品维度（3个细则）
  - 客户信息获取维度（3个细则）
  - 方法论匹配度（1个细则）

### 2. 导师评估
- **评估对象**: 已提交且完成AI评估的会话
- **参考信息**: 可查看AI评估结果作为参考
- **评估内容**: 综合评分 + 详细反馈

### 3. 评估结果展示
- **学员视角**: 查看AI评估和导师评估的详细结果
- **导师视角**: 查看待评估会话列表，进行评估操作

## 测试流程

### 步骤1: 启动系统
```bash
# 启动后端服务
cd mentor-ai-tool/backend
npm start

# 启动前端服务
cd mentor-ai-tool/frontend
npm run dev
```

### 步骤2: 创建练习会话
1. 访问 http://localhost:3000
2. 点击"开始创建任务"进入任务生成页面
3. 配置任务参数（客户画像、产品信息等）
4. 点击"开始对话练习"

### 步骤3: 进行对话练习
1. 在练习聊天页面与AI客户进行对话
2. 尝试运用不同的销售技巧和方法论
3. 进行至少5-10轮对话以获得有意义的评估

### 步骤4: 提交评估
1. 点击"提交评估"按钮
2. 系统会自动触发AI评估
3. 页面会跳转到评估结果页面

### 步骤5: 查看AI评估结果
在评估结果页面可以看到：
- AI综合评分
- 5个维度的详细评分
- 每个维度下的具体细则评分
- 改进建议和优秀表现

### 步骤6: 导师评估（可选）
1. 访问 http://localhost:3000/mentor-evaluation
2. 在待评估列表中选择刚才提交的会话
3. 查看对话记录和AI评估参考
4. 填写导师评分和反馈
5. 提交导师评估

### 步骤7: 查看完整评估
1. 返回评估结果页面
2. 现在可以看到AI评估和导师评估两个标签页
3. 对比AI和导师的评估结果

## 测试要点

### AI评估测试
- **评分合理性**: 检查AI评分是否符合对话质量
- **维度完整性**: 确认所有5个维度都有评分
- **细则详细性**: 验证每个维度下的具体细则评分
- **建议实用性**: 检查改进建议是否具体可行

### 导师评估测试
- **界面易用性**: 导师评估界面是否直观易用
- **信息完整性**: 导师能否看到足够的信息进行评估
- **评估流程**: 从选择会话到提交评估的完整流程
- **结果展示**: 导师评估结果是否正确显示

### 系统集成测试
- **数据一致性**: AI和导师评估数据是否正确保存
- **页面跳转**: 各页面间的跳转是否正常
- **错误处理**: 网络错误或数据异常时的处理
- **用户体验**: 整体使用流程是否流畅

## 预期结果

### AI评估结果示例
```json
{
  "overallScore": 85,
  "dimensionScores": [
    {
      "dimension": "沟通维度",
      "score": 80,
      "details": [
        {
          "criteria": "匹配客户的沟通方式",
          "score": 85,
          "feedback": "能够识别客户的D型性格特征，采用直接高效的沟通方式"
        }
      ],
      "feedback": "沟通技巧整体表现良好，在客户沟通方式识别方面表现突出"
    }
  ],
  "suggestions": [
    "建议在产品介绍时更多运用FAB技巧",
    "可以进一步挖掘客户的深层需求"
  ],
  "strengths": [
    "很好地识别了客户性格特征",
    "产品知识掌握扎实"
  ]
}
```

### 导师评估结果示例
- 综合评分: 88分
- 详细反馈: "学员在本次练习中表现出色，特别是在客户需求挖掘方面有明显进步。建议继续加强竞品对比的客观性。"

## 故障排除

### 常见问题
1. **AI评估失败**: 检查AI服务配置和网络连接
2. **评估结果不显示**: 检查数据库连接和数据完整性
3. **页面跳转失败**: 检查路由配置和会话ID传递
4. **导师评估提交失败**: 检查表单验证和后端接口

### 调试方法
- 查看浏览器控制台错误信息
- 检查后端日志文件
- 使用网络面板查看API请求状态
- 验证数据库中的数据状态

## 技术实现要点

### 后端改进
- `sessions.js`: 在提交会话时自动触发AI评估
- `aiService.js`: 优化评估算法，支持14个评估标准
- `evaluations.js`: 完善导师评估功能

### 前端新增
- `evaluation-result/page.tsx`: 学员评估结果页面
- `mentor-evaluation/page.tsx`: 导师评估页面
- `practice-chat/page.tsx`: 修改提交逻辑，跳转到评估结果

### 数据模型
- `PracticeSession`: 已包含完整的AI和导师评估字段
- 支持详细的维度评分和细则评分结构

## 总结

该评估系统完整实现了sysdesign.md中描述的"反馈与评估机制"，提供了：
1. **AI自动评估**: 基于14个标准的详细分析
2. **导师主观评价**: 专业指导和个性化反馈
3. **双重反馈展示**: 学员可同时查看AI和导师评估
4. **完整工作流程**: 从练习到评估的闭环体验

通过这个系统，学员可以获得及时、专业、多维度的反馈，有效提升销售技能和培训效果。
