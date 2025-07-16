const customerProfileService = require('./customerProfileService');
const logger = require('../utils/logger');

class AICharacterService {
  /**
   * 生成AI客户角色prompt - 升级版，支持保时捷十大客户类型
   */
  generateCustomerPrompt(taskConfig) {
    // 兼容新旧格式
    const config = taskConfig.customerPersonality ? taskConfig : this.convertLegacyFormat(taskConfig);
    
    // 如果指定了客户类型，使用专业的客户类型提示词
    if (config.customerType) {
      try {
        return customerProfileService.generateCustomerTypePrompt(config.customerType, config);
      } catch (error) {
        logger.warn(`Failed to generate customer type prompt for ${config.customerType}:`, error);
        // 降级到智能推荐或随机选择
      }
    }
    
    // 智能推荐客户类型（降低置信度阈值，提高匹配率）
    if (!config.customerType && (config.customerProfession || config.customerPersonality || config.customerFocus)) {
      try {
        const recommendation = customerProfileService.recommendCustomerType({
          profession: config.customerProfession,
          personality: config.customerPersonality,
          focusPoints: config.customerFocus,
          communicationStyle: config.customerCommunication,
          age: config.customerAge
        });
        
        // 降低置信度阈值从0.3到0.1，提高匹配率
        if (recommendation.confidence > 0.1) {
          logger.info(`Auto-recommended customer type: ${recommendation.recommendedType} (confidence: ${recommendation.confidence})`);
          return customerProfileService.generateCustomerTypePrompt(recommendation.recommendedType, config);
        }
      } catch (error) {
        logger.warn('Failed to auto-recommend customer type:', error);
      }
    }
    
    // 如果无法智能匹配，随机选择一个保时捷用户画像
    try {
      const allCustomerTypes = customerProfileService.getAllCustomerTypes();
      const randomType = allCustomerTypes[Math.floor(Math.random() * allCustomerTypes.length)];
      logger.info(`Using random Porsche customer type: ${randomType.name} (fallback mode)`);
      
      return customerProfileService.generateCustomerTypePrompt(randomType.name, config);
    } catch (error) {
      logger.error('Failed to generate random customer type prompt:', error);
    }
    
    // 最后的降级方案：使用基础角色设定（但添加保时捷品牌背景）
    let prompt = `你是一个保时捷汽车销售场景中的模拟客户，请根据以下设定进行角色扮演：

## 任务目标
${config.taskGoal || '保时捷产品咨询'}

## 销售方法论
${config.methodology || '常规销售'}

## 客户背景设定
- 性格特征: ${config.customerPersonality?.join('、') || '理性客观'}
- 职业背景: ${config.customerProfession || '普通消费者'}
- 沟通方式: ${config.customerCommunication || '直接明了'}
- 兴趣爱好: ${config.customerHobbies?.join('、') || '无特殊爱好'}
- 年龄性别: ${config.customerGender || ''} ${config.customerAge || '30-40岁'}

## 本品维度（保时捷）
- 现驾车型: ${config.currentVehicle || '无'}
- 意向车型: ${config.interestedVehicle || '保时捷车型'}
- 关注重点: ${config.customerFocus?.join('、') || '品牌价值和性能'}

## 竞品维度
- 现驾车型: ${config.competitorCurrent || '无'}
- 意向车型: ${config.competitorInterested || '其他豪华品牌'}
- 关注重点: ${config.competitorFocus?.join('、') || '品牌对比'}

## 交易相关
- 洽谈环节: ${config.negotiationStage || '初步了解'}
- 交易关注点: ${config.transactionConcerns?.join('、') || '价格和服务'}

## 保时捷品牌认知
- 对保时捷品牌有基本了解，认可其运动性能和豪华定位
- 可能对保时捷的历史传承、技术创新或驾驶体验有兴趣
- 具备购买豪华品牌汽车的经济实力

请保持角色一致性，根据设定的性格和背景进行自然对话。不要透露你是AI，要像真实的保时捷潜在客户一样提问和回应。`;

    // 根据训练重点添加特殊指令
    if (config.trainingFocus && config.trainingFocus.length > 0) {
      prompt += `\n\n## 训练重点行为指导\n本次对话重点训练：${config.trainingFocus.join('、')}\n`;
      
      if (config.trainingFocus.includes('沟通维度')) {
        prompt += `\n### 沟通维度训练
- 严格按照你的沟通方式特点进行对话（${config.customerCommunication}）
- 测试销售顾问是否能识别并适应你的沟通风格
- 如果销售顾问沟通方式不匹配，表现出不适或困惑`;
      }
      
      if (config.trainingFocus.includes('本品维度')) {
        prompt += `\n### 本品维度训练
- 重点询问保时捷产品的具体配置、功能、优势
- 测试销售顾问的保时捷产品知识深度
- 对产品介绍的准确性和专业性提出质疑`;
      }
      
      if (config.trainingFocus.includes('竞品维度')) {
        prompt += `\n### 竞品维度训练
- 主动提及竞品对比，询问保时捷与其他豪华品牌的差异化优势
- 测试销售顾问对竞品的了解程度
- 挑战销售顾问进行客观的产品对比分析`;
      }
      
      if (config.trainingFocus.includes('客户信息获取维度')) {
        prompt += `\n### 客户信息获取维度训练
- 适度隐藏个人信息，不主动透露需求
- 测试销售顾问的信息挖掘和提问技巧
- 只有在销售顾问问对问题时才逐步透露信息`;
      }
    }

    return prompt;
  }

  /**
   * 转换旧格式配置为新格式
   */
  convertLegacyFormat(taskTemplate) {
    const { customerDimensions, productDimensions, competitorDimensions, transactionDimensions } = taskTemplate;
    
    return {
      taskGoal: taskTemplate.taskGoal || '产品咨询',
      methodology: taskTemplate.methodology || '常规销售',
      trainingFocus: taskTemplate.trainingFocus || [],
      customerPersonality: customerDimensions?.personality ? [customerDimensions.personality] : ['理性'],
      customerProfession: customerDimensions?.profession || '普通消费者',
      customerCommunication: customerDimensions?.communicationStyle || '直接明了',
      customerHobbies: customerDimensions?.hobbies ? [customerDimensions.hobbies] : [],
      customerGender: customerDimensions?.gender || '',
      customerAge: customerDimensions?.age || '30-40岁',
      currentVehicle: productDimensions?.currentVehicle || '无',
      interestedVehicle: productDimensions?.interestedVehicle || '待定',
      customerFocus: productDimensions?.focusPoints || ['价格'],
      competitorCurrent: competitorDimensions?.competitorVehicles?.[0] || '无',
      competitorInterested: competitorDimensions?.competitorVehicles?.[1] || '无',
      competitorFocus: competitorDimensions?.focusPoints || ['价格对比'],
      negotiationStage: transactionDimensions?.stage || '初步了解',
      transactionConcerns: transactionDimensions?.concerns || ['价格']
    };
  }
}

module.exports = new AICharacterService();
