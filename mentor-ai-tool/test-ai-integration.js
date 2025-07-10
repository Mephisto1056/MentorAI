// 测试AI对话集成的简单脚本
const axios = require('axios');

const BACKEND_URL = 'http://localhost:6100';

// 测试配置
const testTaskConfig = {
  taskGoal: '991-2产品介绍',
  methodology: 'FAB产品介绍技巧',
  customerPersonality: ['理性', '数据导向'],
  customerProfession: '金融分析师',
  customerCommunication: 'D控制型',
  customerHobbies: ['高尔夫', '旅游'],
  customerGender: '男',
  customerAge: '30-40',
  currentVehicle: '无',
  interestedVehicle: 'Taycan J2',
  customerFocus: ['动力', '智能化', '残值'],
  competitorCurrent: 'BMW X5',
  competitorInterested: 'SU 7',
  competitorFocus: ['外观', '智能化'],
  negotiationStage: '产品介绍',
  transactionConcerns: ['价格优惠', '残值']
};

const testAiPrompt = `
# AI客户角色设定

## 任务目标
991-2产品介绍

## 销售方法论
FAB产品介绍技巧

## 客户画像
- **性格特征**: 理性、数据导向
- **职业背景**: 金融分析师
- **沟通方式**: D控制型
- **兴趣爱好**: 高尔夫、旅游
- **性别年龄**: 男 30-40岁

## 本品维度
- **现驾车型**: 无
- **意向车型**: Taycan J2
- **关注重点**: 动力、智能化、残值

## 竞品维度
- **现驾车型**: BMW X5
- **意向车型**: SU 7
- **关注重点**: 外观、智能化

## 交易相关
- **洽谈环节**: 产品介绍
- **交易关注点**: 价格优惠、残值

请根据以上设定扮演一位真实的客户，与销售顾问进行自然对话。
`;

async function testAIResponse() {
  try {
    console.log('🧪 测试AI响应生成...');
    
    const response = await axios.post(`${BACKEND_URL}/api/ai/generate-response`, {
      message: '您好，我想了解一下保时捷Taycan J2的动力性能如何？',
      taskConfig: testTaskConfig,
      aiPrompt: testAiPrompt,
      conversationHistory: [
        {
          role: 'ai',
          content: '您好！我是李先生，一位金融分析师。我最近在考虑购买Taycan J2，听说这款车的性能很不错。'
        }
      ]
    });

    if (response.data.success) {
      console.log('✅ AI响应生成成功！');
      console.log('🤖 AI回复:', response.data.response);
    } else {
      console.log('❌ AI响应生成失败:', response.data.message);
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.response?.data || error.message);
  }
}

async function testSessionCreation() {
  try {
    console.log('\n🧪 测试会话创建...');
    
    const response = await axios.post(`${BACKEND_URL}/api/sessions`, {
      taskConfig: testTaskConfig,
      aiPrompt: testAiPrompt,
      customerProfile: {
        name: '李先生',
        profession: '金融分析师',
        personality: ['理性', '数据导向'],
        communicationStyle: 'D控制型',
        interests: ['高尔夫', '旅游'],
        gender: '男',
        age: '30-40'
      },
      sessionName: '测试会话'
    });

    if (response.data.success) {
      console.log('✅ 会话创建成功！');
      console.log('📝 会话ID:', response.data.data._id);
      return response.data.data._id;
    } else {
      console.log('❌ 会话创建失败:', response.data.message);
    }
  } catch (error) {
    console.log('❌ 请求失败:', error.response?.data || error.message);
  }
}

async function testHealthCheck() {
  try {
    console.log('🧪 测试后端健康检查...');
    
    const response = await axios.get(`${BACKEND_URL}/health`);
    
    if (response.data.status === 'OK') {
      console.log('✅ 后端服务正常运行！');
      console.log('⏱️  运行时间:', Math.floor(response.data.uptime), '秒');
    } else {
      console.log('❌ 后端服务状态异常');
    }
  } catch (error) {
    console.log('❌ 无法连接到后端服务:', error.message);
    console.log('💡 请确保后端服务已启动 (npm run dev)');
  }
}

async function runTests() {
  console.log('🚀 开始测试AI对话集成...\n');
  
  // 1. 健康检查
  await testHealthCheck();
  
  // 2. 测试AI响应
  await testAIResponse();
  
  // 3. 测试会话创建
  await testSessionCreation();
  
  console.log('\n✨ 测试完成！');
  console.log('\n📋 下一步：');
  console.log('1. 启动前端: cd mentor-ai-tool/frontend && npm run dev');
  console.log('2. 访问: http://localhost:3000/task-generator');
  console.log('3. 生成任务配置并开始对话练习');
}

// 运行测试
runTests().catch(console.error);
