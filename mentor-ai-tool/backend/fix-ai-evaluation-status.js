const mongoose = require('mongoose');
const PracticeSession = require('./src/models/PracticeSession');

// 数据库连接配置
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://localhost:27017/mentor-ai', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// 修复AI评估状态字段
const fixAIEvaluationStatus = async () => {
  try {
    console.log('开始修复AI评估状态字段...');
    
    // 查找所有没有aiEvaluationStatus字段的会话
    const sessions = await PracticeSession.find({
      $or: [
        { aiEvaluationStatus: { $exists: false } },
        { aiEvaluationStatus: null }
      ]
    });
    
    console.log(`找到 ${sessions.length} 个需要修复的会话`);
    
    let updatedCount = 0;
    
    for (const session of sessions) {
      let newStatus = 'pending';
      
      // 根据现有数据判断状态
      if (session.aiEvaluation && session.aiEvaluation.overallScore != null) {
        // 如果已经有AI评估结果，设置为completed
        newStatus = 'completed';
        console.log(`会话 ${session._id}: 已有AI评估 -> completed`);
      } else if (session.status === 'submitted') {
        // 如果已提交但没有AI评估，设置为in_progress
        newStatus = 'in_progress';
        console.log(`会话 ${session._id}: 已提交但无AI评估 -> in_progress`);
      } else {
        // 其他情况设置为pending
        console.log(`会话 ${session._id}: 默认状态 -> pending`);
      }
      
      // 更新会话
      await PracticeSession.updateOne(
        { _id: session._id },
        { $set: { aiEvaluationStatus: newStatus } }
      );
      
      updatedCount++;
    }
    
    console.log(`✅ 成功更新了 ${updatedCount} 个会话的AI评估状态`);
    
    // 验证更新结果
    const verifyResults = await PracticeSession.aggregate([
      {
        $group: {
          _id: '$aiEvaluationStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📊 AI评估状态分布:');
    verifyResults.forEach(result => {
      console.log(`  ${result._id || 'null'}: ${result.count} 个会话`);
    });
    
  } catch (error) {
    console.error('修复过程中出错:', error);
  }
};

// 主函数
const main = async () => {
  await connectDB();
  await fixAIEvaluationStatus();
  
  console.log('\n🎉 修复完成！');
  process.exit(0);
};

// 运行脚本
main().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
