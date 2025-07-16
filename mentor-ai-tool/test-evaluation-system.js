require('dotenv').config({ path: 'mentor-ai-tool/backend/.env' });
const aiService = require('./backend/src/services/aiService');

// 模拟对话数据
const testConversation = [
  {
    role: 'student',
    message: '您好，欢迎来到保时捷展厅！我是销售顾问小李，请问您今天想了解哪款车型？',
    timestamp: new Date()
  },
  {
    role: 'customer',
    message: '你好，我想看看SUV车型，主要是家用，偶尔也想体验一下运动性能。',
    timestamp: new Date()
  },
  {
    role: 'student',
    message: '那我为您推荐Cayenne系列，它完美结合了SUV的实用性和保时捷的运动基因。请问您平时主要是几个人用车？',
    timestamp: new Date()
  },
  {
    role: 'customer',
    message: '主要是我和我太太，偶尔带孩子。我比较关心动力性能和燃油经济性。',
    timestamp: new Date()
  },
  {
    role: 'student',
    message: 'Cayenne有多种动力选择，基础版本就有340马力，而且采用了混动技术，既保证了性能又兼顾了燃油经济性。相比宝马X5，我们的加速更快，油耗更低。',
    timestamp: new Date()
  },
  {
    role: 'customer',
    message: '听起来不错，价格方面呢？和宝马X5比怎么样？',
    timestamp: new Date()
  },
  {
    role: 'student',
    message: '价格方面，Cayenne的起售价确实比X5略高，但考虑到保时捷的品牌价值、更强的性能表现和更好的保值率，性价比是很高的。您可以考虑我们的金融方案。',
    timestamp: new Date()
  }
];

// 模拟评估标准
const testEvaluationCriteria = {
  taskGoal: '保时捷SUV销售咨询',
  methodology: 'FAB产品介绍技巧',
  customerProfile: {
    name: '张先生',
    profession: '企业高管',
    personality: ['理性', '注重性能'],
    communicationStyle: '直接明了',
    interests: ['汽车', '运动'],
    focusPoints: ['性能', '品牌价值']
  }
};

async function testEvaluationSystem() {
  console.log('🚀 开始测试AI评估系统...\n');
  
  try {
    console.log('📝 测试对话内容:');
    testConversation.forEach((msg, index) => {
      const role = msg.role === 'student' ? '销售顾问' : '客户';
      console.log(`${index + 1}. ${role}: ${msg.message}`);
    });
    
    console.log('\n🤖 正在调用AI评估服务...');
    
    const evaluationResult = await aiService.evaluatePerformance(
      testConversation,
      testEvaluationCriteria
    );
    
    console.log('\n✅ AI评估完成！结果如下:\n');
    
    // 显示总分
    console.log(`🎯 总体评分: ${evaluationResult.overallScore}分`);
    
    // 显示各维度详细评分
    console.log('\n📊 详细评分:');
    evaluationResult.dimensionScores.forEach((dimension, index) => {
      console.log(`\n${index + 1}. ${dimension.dimension} - ${dimension.score}分`);
      console.log(`   总体反馈: ${dimension.feedback}`);
      
      if (dimension.details && dimension.details.length > 0) {
        console.log('   具体细则:');
        dimension.details.forEach((detail, detailIndex) => {
          console.log(`   ${detailIndex + 1}) ${detail.criteria}: ${detail.score}分`);
          console.log(`      反馈: ${detail.feedback}`);
          if (detail.evidence) {
            console.log(`      📝 对话依据: "${detail.evidence}"`);
          } else {
            console.log(`      📝 对话依据: 无相关对话内容`);
          }
        });
      }
    });
    
    // 显示改进建议
    if (evaluationResult.suggestions && evaluationResult.suggestions.length > 0) {
      console.log('\n💡 改进建议:');
      evaluationResult.suggestions.forEach((suggestion, index) => {
        console.log(`${index + 1}. ${suggestion}`);
      });
    }
    
    // 显示优势
    if (evaluationResult.strengths && evaluationResult.strengths.length > 0) {
      console.log('\n✨ 表现优秀的方面:');
      evaluationResult.strengths.forEach((strength, index) => {
        console.log(`${index + 1}. ${strength}`);
      });
    }
    
    console.log('\n🎉 测试完成！AI评估系统运行正常。');
    
    // 检查evidence字段是否存在
    let hasEvidence = false;
    evaluationResult.dimensionScores.forEach(dimension => {
      if (dimension.details) {
        dimension.details.forEach(detail => {
          if (detail.evidence && detail.evidence.trim() !== '') {
            hasEvidence = true;
          }
        });
      }
    });
    
    if (hasEvidence) {
      console.log('✅ 对话内容召回功能正常工作！');
    } else {
      console.log('⚠️  注意: 当前使用的是默认评估结果，需要配置AI服务才能获得真实的对话内容召回。');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.log('\n🔧 可能的解决方案:');
    console.log('1. 检查AI服务配置 (ALICLOUD_API_KEY 或 OPENAI_API_KEY)');
    console.log('2. 确保网络连接正常');
    console.log('3. 检查AI服务是否可用');
  }
}

// 运行测试
testEvaluationSystem();
