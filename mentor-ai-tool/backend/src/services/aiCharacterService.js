const customerProfileService = require('./customerProfileService');
const logger = require('../utils/logger');

class AICharacterService {
  /**
   * 生成AI客户角色prompt - 以前端用户选择为主，保时捷画像为参考
   */
  generateCustomerPrompt(taskConfig) {
    // 兼容新旧格式 - 检查是否为新格式（有新格式的字段）或旧格式（有旧格式的结构）
    const isNewFormat = taskConfig.customerPersonality || taskConfig.customerProfession || taskConfig.customerCommunication || 
                       taskConfig.customerAge || taskConfig.customerGender || taskConfig.customerFocus || taskConfig.customerHobbies;
    const config = isNewFormat ? taskConfig : this.convertLegacyFormat(taskConfig);
    let selectedCustomerType = null;
    let finalConfig = { ...config };
    
    // 优先使用用户的具体配置生成基础prompt
    if (this.hasUserSpecificConfig(config)) {
      // 用户有具体配置，以用户配置为主
      logger.info('Using user-specific configuration as primary source');
      
      // 如果用户指定了客户类型，作为参考增强prompt
      if (config.customerType) {
        try {
          selectedCustomerType = config.customerType;
          const enhancedPrompt = this.generateEnhancedPromptWithReference(config, selectedCustomerType);
          return { prompt: enhancedPrompt, customerType: selectedCustomerType, source: 'user-config-with-reference' };
        } catch (error) {
          logger.warn(`Failed to enhance with customer type ${config.customerType}:`, error);
        }
      }
      
      // 生成基于用户配置的基础prompt
      const userBasedPrompt = this.generateUserBasedPrompt(config);
      return { prompt: userBasedPrompt, customerType: '用户自定义', source: 'user-config' };
    }
    
    // 如果用户配置较少，才使用智能推荐作为补充
    if (!config.customerType && (config.customerProfession || config.customerPersonality || config.customerFocus)) {
      try {
        const recommendation = customerProfileService.recommendCustomerType({
          profession: config.customerProfession,
          personality: config.customerPersonality,
          focusPoints: config.customerFocus,
          communicationStyle: config.customerCommunication,
          age: config.customerAge
        });
        
        // 只有在高置信度时才使用推荐，否则以用户配置为主
        if (recommendation.confidence > 0.6) {
          selectedCustomerType = recommendation.recommendedType;
          logger.info(`High-confidence recommendation: ${selectedCustomerType} (confidence: ${recommendation.confidence})`);
          
          const enhancedPrompt = this.generateEnhancedPromptWithReference(config, selectedCustomerType);
          return { prompt: enhancedPrompt, customerType: selectedCustomerType, source: 'smart-recommendation' };
        } else {
          // 置信度不高，仍以用户配置为主
          logger.info(`Low-confidence recommendation (${recommendation.confidence}), using user config as primary`);
          const userBasedPrompt = this.generateUserBasedPrompt(config);
          return { prompt: userBasedPrompt, customerType: '用户自定义', source: 'user-config-low-confidence' };
        }
      } catch (error) {
        logger.warn('Failed to auto-recommend customer type:', error);
      }
    }
    
    // 如果指定了客户类型但没有其他配置，使用客户类型模板
    if (config.customerType) {
      try {
        selectedCustomerType = config.customerType;
        const prompt = customerProfileService.generateCustomerTypePrompt(config.customerType, config);
        return { prompt, customerType: config.customerType, source: 'customer-type-template' };
      } catch (error) {
        logger.warn(`Failed to generate customer type prompt for ${config.customerType}:`, error);
      }
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

    return { prompt, customerType: '通用客户' };
  }

  /**
   * 调整配置以匹配客户类型特征
   */
  adjustConfigForCustomerType(config, customerType) {
    try {
      const customerTypeData = customerProfileService.porscheCustomerTypes[customerType];
      if (!customerTypeData) {
        logger.warn(`Unknown customer type: ${customerType}`);
        return config;
      }

      const characteristics = customerTypeData.characteristics;
      const adjustedConfig = { ...config };
      let adjustments = [];

      // 调整年龄以匹配客户类型
      if (characteristics.ageRange && (!config.customerAge || !this.isAgeCompatible(config.customerAge, characteristics.ageRange))) {
        adjustedConfig.customerAge = characteristics.ageRange;
        adjustments.push(`年龄调整为 ${characteristics.ageRange}`);
      }

      // 调整性别以匹配客户类型
      if (characteristics.gender && (!config.customerGender || !this.isGenderCompatible(config.customerGender, characteristics.gender))) {
        const suggestedGender = this.extractGenderFromDescription(characteristics.gender);
        if (suggestedGender) {
          adjustedConfig.customerGender = suggestedGender;
          adjustments.push(`性别调整为 ${suggestedGender}`);
        }
      }

      // 调整职业以匹配客户类型
      if (characteristics.profession && characteristics.profession.length > 0) {
        if (!config.customerProfession || !characteristics.profession.some(p => 
          p.includes(config.customerProfession) || config.customerProfession.includes(p))) {
          adjustedConfig.customerProfession = characteristics.profession[0];
          adjustments.push(`职业调整为 ${characteristics.profession[0]}`);
        }
      }

      // 调整沟通方式以匹配客户类型
      if (characteristics.communicationStyle && config.customerCommunication !== characteristics.communicationStyle) {
        adjustedConfig.customerCommunication = characteristics.communicationStyle;
        adjustments.push(`沟通方式调整为 ${characteristics.communicationStyle}`);
      }

      // 调整性格特征以匹配客户类型
      if (characteristics.personality && characteristics.personality.length > 0) {
        // 保留用户原有的性格特征，但确保至少包含一个匹配的特征
        const userPersonalities = config.customerPersonality || [];
        const hasMatchingTrait = userPersonalities.some(trait => characteristics.personality.includes(trait));
        
        if (!hasMatchingTrait) {
          // 添加一个匹配的性格特征
          const matchingTrait = characteristics.personality[0];
          adjustedConfig.customerPersonality = [...userPersonalities, matchingTrait];
          adjustments.push(`添加性格特征 ${matchingTrait}`);
        }
      }

      // 调整关注点以匹配客户类型
      if (characteristics.focusPoints && characteristics.focusPoints.length > 0) {
        const userFocus = config.customerFocus || [];
        const hasMatchingFocus = userFocus.some(focus => 
          characteristics.focusPoints.some(cf => cf.includes(focus) || focus.includes(cf)));
        
        if (!hasMatchingFocus) {
          // 添加一个匹配的关注点
          const matchingFocus = characteristics.focusPoints[0];
          adjustedConfig.customerFocus = [...userFocus, matchingFocus];
          adjustments.push(`添加关注点 ${matchingFocus}`);
        }
      }

      // 调整兴趣爱好以匹配客户类型
      if (characteristics.hobbies && characteristics.hobbies.length > 0) {
        const userHobbies = config.customerHobbies || [];
        const hasMatchingHobby = userHobbies.some(hobby => characteristics.hobbies.includes(hobby));
        
        if (!hasMatchingHobby && userHobbies.length === 0) {
          // 如果用户没有设置爱好，添加一个匹配的爱好
          adjustedConfig.customerHobbies = [characteristics.hobbies[0]];
          adjustments.push(`添加兴趣爱好 ${characteristics.hobbies[0]}`);
        }
      }

      // 记录调整信息
      if (adjustments.length > 0) {
        logger.info(`Config adjusted for customer type ${customerType}: ${adjustments.join(', ')}`);
      }

      return adjustedConfig;
    } catch (error) {
      logger.error('Error adjusting config for customer type:', error);
      return config;
    }
  }

  /**
   * 检查年龄是否兼容
   */
  isAgeCompatible(userAge, typeAgeRange) {
    if (!userAge || !typeAgeRange) return false;
    
    // 提取用户年龄的数字
    const userAgeNum = parseInt(userAge.replace(/[^0-9]/g, ''));
    if (isNaN(userAgeNum)) return false;
    
    // 提取类型年龄范围
    const [min, max] = typeAgeRange.split('-').map(Number);
    return userAgeNum >= min && userAgeNum <= max;
  }

  /**
   * 检查性别是否兼容
   */
  isGenderCompatible(userGender, typeGenderDescription) {
    if (!userGender || !typeGenderDescription) return true; // 如果没有限制，认为兼容
    
    if (typeGenderDescription.includes('男性为主') && userGender === '女') return false;
    if (typeGenderDescription.includes('女性') && userGender === '男') return false;
    
    return true;
  }

  /**
   * 从性别描述中提取建议的性别
   */
  extractGenderFromDescription(genderDescription) {
    if (genderDescription.includes('男性为主')) return '男';
    if (genderDescription.includes('女性较多')) return '女';
    if (genderDescription.includes('女性')) return '女';
    return null; // 男女均有的情况不强制调整
  }

  /**
   * 检查用户是否有具体的配置信息
   */
  hasUserSpecificConfig(config) {
    // 检查用户是否提供了足够的具体配置信息
    const hasPersonality = config.customerPersonality && config.customerPersonality.length > 0;
    const hasProfession = config.customerProfession && config.customerProfession !== '普通消费者';
    const hasCommunication = config.customerCommunication && config.customerCommunication !== '直接明了';
    const hasAge = config.customerAge && config.customerAge !== '30-40岁';
    const hasGender = config.customerGender;
    const hasFocus = config.customerFocus && config.customerFocus.length > 0;
    const hasHobbies = config.customerHobbies && config.customerHobbies.length > 0;
    
    // 如果用户提供了1个或以上的具体配置，认为有用户特定配置
    const configCount = [hasPersonality, hasProfession, hasCommunication, hasAge, hasGender, hasFocus, hasHobbies].filter(Boolean).length;
    return configCount >= 1;
  }

  /**
   * 生成基于用户配置的prompt
   */
  generateUserBasedPrompt(config) {
    let prompt = `你是一个保时捷汽车销售场景中的模拟客户，请根据以下设定进行角色扮演：

## 任务目标
${config.taskGoal || '保时捷产品咨询'}

## 销售方法论
${config.methodology || '常规销售'}

## 客户背景设定（以用户配置为准）
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

## 角色扮演要求
- 严格按照上述用户设定的特征进行对话
- 保持角色一致性，体现设定的性格、职业和沟通方式
- 不要透露你是AI，要像真实的保时捷潜在客户一样提问和回应
- 根据设定的关注点和交易关注点来引导对话方向`;

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
   * 生成增强的prompt（用户配置+保时捷画像参考）
   */
  generateEnhancedPromptWithReference(config, customerType) {
    try {
      const customerTypeData = customerProfileService.porscheCustomerTypes[customerType];
      if (!customerTypeData) {
        // 如果客户类型不存在，回退到用户配置
        return this.generateUserBasedPrompt(config);
      }

      const characteristics = customerTypeData.characteristics;
      
      let prompt = `你是一个保时捷汽车销售场景中的模拟客户，请根据以下设定进行角色扮演：

## 任务目标
${config.taskGoal || '保时捷产品咨询'}

## 销售方法论
${config.methodology || '常规销售'}

## 客户背景设定（以用户配置为主，${customerType}特征为参考）
- 性格特征: ${config.customerPersonality?.join('、') || characteristics.personality.slice(0, 2).join('、')}
- 职业背景: ${config.customerProfession || characteristics.profession[0]}
- 沟通方式: ${config.customerCommunication || characteristics.communicationStyle}
- 兴趣爱好: ${config.customerHobbies?.join('、') || characteristics.hobbies.slice(0, 2).join('、')}
- 年龄性别: ${config.customerGender || this.extractGenderFromDescription(characteristics.gender) || ''} ${config.customerAge || characteristics.ageRange}

## 本品维度（保时捷）
- 现驾车型: ${config.currentVehicle || '无'}
- 意向车型: ${config.interestedVehicle || '保时捷车型'}
- 关注重点: ${config.customerFocus?.join('、') || characteristics.focusPoints.slice(0, 3).join('、')}

## 竞品维度
- 现驾车型: ${config.competitorCurrent || '无'}
- 意向车型: ${config.competitorInterested || '其他豪华品牌'}
- 关注重点: ${config.competitorFocus?.join('、') || '品牌对比'}

## 交易相关
- 洽谈环节: ${config.negotiationStage || '初步了解'}
- 交易关注点: ${config.transactionConcerns?.join('、') || '价格和服务'}

## ${customerType}特征参考
- 决策特点: ${characteristics.decisionMaking}
- 购买行为: ${characteristics.purchaseBehavior}
- 对话风格: ${characteristics.conversationStyle}

## 角色扮演要求
- 优先体现用户设定的具体特征
- 参考${customerType}的行为模式和对话风格
- 保持角色一致性，不要透露你是AI
- 像真实的保时捷潜在客户一样自然对话`;

      // 根据训练重点添加特殊指令
      if (config.trainingFocus && config.trainingFocus.length > 0) {
        prompt += `\n\n## 训练重点行为指导\n本次对话重点训练：${config.trainingFocus.join('、')}\n`;
        
        if (config.trainingFocus.includes('沟通维度')) {
          prompt += `\n### 沟通维度训练
- 严格按照你的沟通方式特点进行对话（${config.customerCommunication || characteristics.communicationStyle}）
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
    } catch (error) {
      logger.error('Error generating enhanced prompt:', error);
      return this.generateUserBasedPrompt(config);
    }
  }

  /**
   * 转换旧格式配置为新格式
   */
  convertLegacyFormat(taskTemplate) {
    const { customerDimensions, productDimensions, competitorDimensions, transactionDimensions } = taskTemplate;
    
    return {
      customerType: taskTemplate.customerType, // 保留原始的customerType
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
