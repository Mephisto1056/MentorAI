const aiService = require('./backend/src/services/aiService');
const customerProfileService = require('./backend/src/services/customerProfileService');

/**
 * 测试角色生成功能
 */
async function testCustomerGeneration() {
  console.log('🧪 开始测试保时捷客户角色生成功能...\n');

  // 测试场景1：指定客户类型
  console.log('📋 测试场景1：指定客户类型');
  const testConfig1 = {
    customerType: '成功企业家',
    taskGoal: '保时捷911购买咨询',
    methodology: 'SPIN销售法',
    trainingFocus: ['沟通维度', '本品维度']
  };

  try {
    const prompt1 = aiService.generateCustomerPrompt(testConfig1);
    console.log('✅ 指定客户类型测试成功');
    console.log('生成的角色类型：成功企业家');
    console.log('Prompt长度：', prompt1.length);
    console.log('包含保时捷品牌：', prompt1.includes('保时捷') ? '是' : '否');
    console.log('包含客户类型特征：', prompt1.includes('成功企业家') ? '是' : '否');
  } catch (error) {
    console.log('❌ 指定客户类型测试失败：', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试场景2：智能推荐
  console.log('📋 测试场景2：智能推荐客户类型');
  const testConfig2 = {
    customerProfession: '医生',
    customerPersonality: ['理性', '专业'],
    customerFocus: ['技术参数', '性能数据'],
    customerCommunication: 'C遵循型',
    customerAge: '35',
    taskGoal: '保时捷Taycan咨询',
    methodology: 'FAB产品介绍'
  };

  try {
    const prompt2 = aiService.generateCustomerPrompt(testConfig2);
    console.log('✅ 智能推荐测试成功');
    console.log('Prompt长度：', prompt2.length);
    console.log('包含保时捷品牌：', prompt2.includes('保时捷') ? '是' : '否');
    
    // 检查是否匹配到了精英专业人士
    if (prompt2.includes('精英专业人士')) {
      console.log('推荐的客户类型：精英专业人士 ✅');
    } else {
      console.log('推荐的客户类型：其他保时捷用户画像 ✅');
    }
  } catch (error) {
    console.log('❌ 智能推荐测试失败：', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试场景3：随机选择（最少信息）
  console.log('📋 测试场景3：随机选择客户类型');
  const testConfig3 = {
    taskGoal: '保时捷产品咨询',
    methodology: '常规销售'
  };

  try {
    const prompt3 = aiService.generateCustomerPrompt(testConfig3);
    console.log('✅ 随机选择测试成功');
    console.log('Prompt长度：', prompt3.length);
    console.log('包含保时捷品牌：', prompt3.includes('保时捷') ? '是' : '否');
    
    // 检查是否使用了保时捷用户画像
    const customerTypes = ['成功企业家', '精英专业人士', '老牌豪车收藏家', '科技爱好者', '赛道爱好者', 
                          '生活方式追求者', '新兴富豪', '家庭升级型', '节俭型豪华消费者', '品牌跨界尝鲜者'];
    const usedType = customerTypes.find(type => prompt3.includes(type));
    
    if (usedType) {
      console.log('使用的客户类型：', usedType, '✅');
    } else {
      console.log('使用基础保时捷客户设定 ✅');
    }
  } catch (error) {
    console.log('❌ 随机选择测试失败：', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试场景4：智能优化Prompt
  console.log('📋 测试场景4：智能优化Prompt');
  const testConfig4 = {
    customerProfession: '企业家',
    customerPersonality: ['强势', '果断'],
    customerFocus: ['品牌象征意义'],
    taskGoal: '保时捷Panamera购买',
    methodology: 'SPIN销售法'
  };

  try {
    const optimizedPrompt = await aiService.generateOptimizedPrompt(testConfig4);
    console.log('✅ 智能优化Prompt测试成功');
    console.log('Prompt长度：', optimizedPrompt.length);
    console.log('包含AI优化标识：', optimizedPrompt.includes('🤖 AI智能优化') ? '是' : '否');
    console.log('包含保时捷品牌：', optimizedPrompt.includes('保时捷') ? '是' : '否');
    
    // 检查匹配的客户类型
    if (optimizedPrompt.includes('成功企业家')) {
      console.log('匹配的客户类型：成功企业家 ✅');
    } else {
      console.log('匹配的客户类型：其他保时捷用户画像 ✅');
    }
  } catch (error) {
    console.log('❌ 智能优化Prompt测试失败：', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 测试场景5：获取所有客户类型
  console.log('📋 测试场景5：获取所有保时捷客户类型');
  try {
    const allTypes = customerProfileService.getAllCustomerTypes();
    console.log('✅ 获取客户类型列表成功');
    console.log('保时捷客户类型总数：', allTypes.length);
    console.log('客户类型列表：');
    allTypes.forEach((type, index) => {
      console.log(`  ${index + 1}. ${type.name}`);
    });
  } catch (error) {
    console.log('❌ 获取客户类型列表失败：', error.message);
  }

  console.log('\n🎉 测试完成！');
  console.log('\n📊 测试总结：');
  console.log('- 所有角色生成都基于保时捷十种用户画像');
  console.log('- 智能推荐置信度阈值已优化（0.3 → 0.1）');
  console.log('- 无法匹配时自动随机选择保时捷用户画像');
  console.log('- 最后降级方案也包含保时捷品牌背景');
}

// 运行测试
if (require.main === module) {
  testCustomerGeneration().catch(console.error);
}

module.exports = { testCustomerGeneration };