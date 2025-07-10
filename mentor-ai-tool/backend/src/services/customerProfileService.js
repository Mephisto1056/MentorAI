const logger = require('../utils/logger');

/**
 * 保时捷客户类型服务
 * 基于保时捷潜在客户十大类型分析，提供专业的客户角色生成
 */
class CustomerProfileService {
  constructor() {
    // 保时捷十大客户类型定义
    this.porscheCustomerTypes = {
      '成功企业家': {
        description: '注重品牌象征意义，决策快速果断，偏好个性化定制',
        characteristics: {
          personality: ['强势', '主导权', '独立', '果断'],
          profession: ['企业家', '公司CEO', '投资人', '实业家'],
          communicationStyle: 'D控制型',
          decisionMaking: '快速果断',
          pricesensitivity: '对价格不敏感',
          focusPoints: ['品牌象征意义', '个性化定制', '高端配置', '身份象征'],
          purchaseBehavior: '一次性全款购买，选择高端配置',
          socialInfluence: '受同行影响较大',
          hobbies: ['高尔夫', '商务社交', '收藏', '投资'],
          ageRange: '35-55',
          gender: '男性为主',
          conversationStyle: '直接明了，时间宝贵，重视效率',
          keyTriggers: ['品牌价值', '定制服务', 'VIP体验', '同行认可'],
          objections: ['交付时间', '定制选项', '售后服务级别'],
          buyingSignals: ['询问定制选项', '关注VIP服务', '提及同行购买经历']
        }
      },
      '精英专业人士': {
        description: '理性分析价值与性能比，详细研究技术参数，重视专业评测意见',
        characteristics: {
          personality: ['理性', '数据导向', '专业', '谨慎'],
          profession: ['医生', '律师', '工程师', '金融分析师', '咨询顾问'],
          communicationStyle: 'C遵循型',
          decisionMaking: '理性分析，充分对比',
          priceSelection: '对价格不敏感，但重视性价比',
          focusPoints: ['技术参数', '性能数据', '专业评测', '价值分析'],
          purchaseBehavior: '详细研究后决策，重视专业意见',
          socialInfluence: '受专业评测和权威意见影响',
          hobbies: ['阅读', '研究', '专业学习', '技术探讨'],
          ageRange: '30-50',
          gender: '男女均有',
          conversationStyle: '喜欢详细数据，重视逻辑分析',
          keyTriggers: ['技术优势', '性能数据', '专业认证', '对比分析'],
          objections: ['技术细节质疑', '竞品对比', '长期价值'],
          buyingSignals: ['深入技术讨论', '要求详细资料', '询问专业测试']
        }
      },
      '老牌豪车收藏家': {
        description: '重视品牌历史传承，熟悉每款车型的发展历程，追求稀有限量版',
        characteristics: {
          personality: ['传统', '品味', '收藏癖', '历史情怀'],
          profession: ['收藏家', '艺术家', '文化人士', '资深车迷'],
          communicationStyle: 'S稳定型',
          decisionMaking: '基于收藏价值和情感连接',
          priceSelection: '价格不敏感，追求稀有性',
          focusPoints: ['品牌历史', '车型传承', '限量版', '收藏价值'],
          purchaseBehavior: '重视购买体验和仪式感',
          socialInfluence: '受品牌历史和收藏圈影响',
          hobbies: ['收藏', '历史研究', '品鉴', '文化活动'],
          ageRange: '45-65',
          gender: '男性为主',
          conversationStyle: '重视历史故事，享受购买过程',
          keyTriggers: ['品牌传承', '历史故事', '限量稀有', '收藏价值'],
          objections: ['历史真实性', '保值潜力', '收藏意义'],
          buyingSignals: ['询问车型历史', '关注限量信息', '重视购买仪式']
        }
      },
      '科技爱好者': {
        description: '关注最新技术创新，热衷于保时捷混合动力和纯电动车型',
        characteristics: {
          personality: ['创新', '前瞻', '技术控', '环保意识'],
          profession: ['IT工程师', '科技公司高管', '研发人员', '创业者'],
          communicationStyle: 'I影响型',
          decisionMaking: '受技术指标和可持续性驱动',
          priceSelection: '对价格不敏感，重视技术价值',
          focusPoints: ['最新技术', '电动化', '智能功能', '可持续性'],
          purchaseBehavior: '深入研究新功能，体验驱动',
          socialInfluence: '受科技媒体和创新趋势影响',
          hobbies: ['科技产品', '创新体验', '环保活动', '未来趋势'],
          ageRange: '28-45',
          gender: '男女均有',
          conversationStyle: '热衷讨论新技术，重视创新体验',
          keyTriggers: ['技术创新', '电动性能', '智能功能', '环保理念'],
          objections: ['技术成熟度', '充电便利性', '软件更新'],
          buyingSignals: ['体验新功能', '询问技术细节', '关注未来升级']
        }
      },
      '赛道爱好者': {
        description: '极度重视驾驶体验和操控性能，决策基于赛道测试成绩',
        characteristics: {
          personality: ['激情', '专业', '追求极致', '竞技精神'],
          profession: ['赛车手', '驾驶教练', '汽车媒体', '性能车爱好者'],
          communicationStyle: 'D控制型',
          decisionMaking: '基于性能数据和驾驶体验',
          priceSelection: '愿意为性能提升支付额外费用',
          focusPoints: ['马力数据', '加速性能', '操控性', '赛道成绩'],
          purchaseBehavior: '必须试驾体验，重视性能配置',
          socialInfluence: '受赛车圈和专业车手影响',
          hobbies: ['赛车', '驾驶培训', '改装', '赛道日'],
          ageRange: '25-50',
          gender: '男性为主',
          conversationStyle: '专业术语，重视实际体验',
          keyTriggers: ['性能数据', '驾驶体验', '赛道表现', '专业配置'],
          objections: ['性能参数', '竞品对比', '改装潜力'],
          buyingSignals: ['要求试驾', '询问性能配置', '讨论赛道表现']
        }
      },
      '生活方式追求者': {
        description: '视保时捷为生活品质象征，决策受社交圈影响，重视品牌带来的身份认同',
        characteristics: {
          personality: ['时尚', '社交', '品质追求', '身份认同'],
          profession: ['时尚行业', '媒体人士', '社交名流', '生活方式博主'],
          communicationStyle: 'I影响型',
          decisionMaking: '受社交圈和生活方式影响',
          priceSelection: '对价格不敏感，重视品牌价值',
          focusPoints: ['生活品质', '社交价值', '品牌形象', '整体体验'],
          purchaseBehavior: '重视购买和拥有体验，喜欢品牌活动',
          socialInfluence: '受社交媒体和朋友圈影响很大',
          hobbies: ['时尚', '社交', '旅行', '品质生活'],
          ageRange: '30-45',
          gender: '女性较多',
          conversationStyle: '重视感受和体验，喜欢分享',
          keyTriggers: ['生活品质', '社交价值', '品牌体验', '服务感受'],
          objections: ['服务体验', '品牌形象', '社交认可'],
          buyingSignals: ['关注品牌活动', '重视服务体验', '询问社交价值']
        }
      },
      '新兴富豪': {
        description: '决策直接快速，看重即时满足感，品牌象征意义大于实用性',
        characteristics: {
          personality: ['直接', '快速', '炫耀', '即时满足'],
          profession: ['新兴企业家', '网红', '投资新贵', '暴富人群'],
          communicationStyle: 'D控制型',
          decisionMaking: '快速直接，重视即时满足',
          priceSelection: '对价格不敏感，追求最新最显眼',
          focusPoints: ['品牌象征', '最新款式', '显眼外观', '即时拥有'],
          purchaseBehavior: '冲动购买，喜欢最新最显眼的车型',
          socialInfluence: '受明星和社交媒体影响',
          hobbies: ['社交媒体', '奢侈品', '派对', '炫富'],
          ageRange: '25-40',
          gender: '男女均有',
          conversationStyle: '直接快速，重视面子和炫耀价值',
          keyTriggers: ['最新款式', '独特外观', '明星同款', '即时交付'],
          objections: ['交付时间', '独特性', '炫耀价值'],
          buyingSignals: ['询问最新款', '关注外观配色', '要求快速交付']
        }
      },
      '家庭升级型': {
        description: '将保时捷视为家庭用车升级选择，关注SUV和四门轿车模型',
        characteristics: {
          personality: ['务实', '家庭责任', '平衡考虑', '升级需求'],
          profession: ['中高管', '成功专业人士', '家庭支柱', '事业有成者'],
          communicationStyle: 'S稳定型',
          decisionMaking: '平衡性能与实用性，重视家人意见',
          priceSelection: '对价格有一定敏感度，但能承受豪华品牌',
          focusPoints: ['实用性', '安全性', '舒适度', '家庭需求'],
          purchaseBehavior: '决策过程较长，会征求家人意见',
          socialInfluence: '受家庭成员和朋友影响',
          hobbies: ['家庭活动', '旅行', '运动', '亲子时光'],
          ageRange: '35-50',
          gender: '男女均有',
          conversationStyle: '重视实用价值，关心家庭感受',
          keyTriggers: ['家庭实用性', '安全配置', '舒适性', '空间表现'],
          objections: ['实用性', '安全性', '家人接受度'],
          buyingSignals: ['询问家庭功能', '关注安全配置', '考虑家人意见']
        }
      },
      '节俭型豪华消费者': {
        description: '精打细算购买入门级保时捷，详细研究二手市场，关注车辆保值率',
        characteristics: {
          personality: ['精明', '节俭', '理性', '价值导向'],
          profession: ['小企业主', '专业人士', '理财专家', '价值投资者'],
          communicationStyle: 'C遵循型',
          decisionMaking: '谨慎且长期考虑，重视性价比',
          priceSelection: '价格敏感，追求最佳性价比',
          focusPoints: ['保值率', '运营成本', '入门配置', '二手价值'],
          purchaseBehavior: '决策周期长，经常通过融资租赁',
          socialInfluence: '受理财建议和实用主义影响',
          hobbies: ['理财', '投资', '研究', '节约生活'],
          ageRange: '30-55',
          gender: '男女均有',
          conversationStyle: '重视数据分析，关注长期价值',
          keyTriggers: ['保值率', '运营成本', '融资方案', '入门配置'],
          objections: ['总拥有成本', '保值能力', '维护费用'],
          buyingSignals: ['询问保值率', '关注融资方案', '对比运营成本']
        }
      },
      '品牌跨界尝鲜者': {
        description: '拥有其他豪华品牌车辆后尝试保时捷，决策基于品牌对比和差异化体验',
        characteristics: {
          personality: ['好奇', '体验导向', '品牌忠诚度低', '追求新鲜'],
          profession: ['多元化投资者', '体验型消费者', '品牌收集者', '汽车爱好者'],
          communicationStyle: 'I影响型',
          decisionMaking: '基于品牌对比和差异化体验',
          priceSelection: '对价格不敏感，重视独特体验',
          focusPoints: ['品牌差异', '独特体验', '驾驶感受', '品牌对比'],
          purchaseBehavior: '尝试性消费，重视差异化体验',
          socialInfluence: '受多品牌体验和对比影响',
          hobbies: ['汽车体验', '品牌研究', '生活体验', '收集癖好'],
          ageRange: '35-55',
          gender: '男性为主',
          conversationStyle: '喜欢对比分析，重视独特性',
          keyTriggers: ['品牌差异', '独特体验', '驾驶感受', '与其他品牌对比'],
          objections: ['与现有品牌对比', '独特价值', '切换成本'],
          buyingSignals: ['对比其他品牌', '体验差异化', '询问独特优势']
        }
      }
    };

    // 客户类型权重配置（用于智能推荐）
    this.typeWeights = {
      profession: 0.3,
      personality: 0.25,
      focusPoints: 0.2,
      communicationStyle: 0.15,
      ageRange: 0.1
    };
  }

  /**
   * 根据基础信息智能推荐客户类型
   */
  recommendCustomerType(basicInfo) {
    const scores = {};
    
    Object.keys(this.porscheCustomerTypes).forEach(typeName => {
      const type = this.porscheCustomerTypes[typeName];
      let score = 0;
      
      // 职业匹配
      if (basicInfo.profession && type.characteristics.profession.some(p => 
        p.includes(basicInfo.profession) || basicInfo.profession.includes(p))) {
        score += this.typeWeights.profession;
      }
      
      // 性格匹配
      if (basicInfo.personality && basicInfo.personality.length > 0) {
        const matchCount = basicInfo.personality.filter(p => 
          type.characteristics.personality.includes(p)).length;
        score += (matchCount / basicInfo.personality.length) * this.typeWeights.personality;
      }
      
      // 关注点匹配
      if (basicInfo.focusPoints && basicInfo.focusPoints.length > 0) {
        const matchCount = basicInfo.focusPoints.filter(f => 
          type.characteristics.focusPoints.some(tf => tf.includes(f) || f.includes(tf))).length;
        score += (matchCount / basicInfo.focusPoints.length) * this.typeWeights.focusPoints;
      }
      
      // 沟通方式匹配
      if (basicInfo.communicationStyle === type.characteristics.communicationStyle) {
        score += this.typeWeights.communicationStyle;
      }
      
      // 年龄匹配
      if (basicInfo.age && this.isAgeInRange(basicInfo.age, type.characteristics.ageRange)) {
        score += this.typeWeights.ageRange;
      }
      
      scores[typeName] = score;
    });
    
    // 返回得分最高的类型
    const recommendedType = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    return {
      recommendedType,
      confidence: scores[recommendedType],
      allScores: scores
    };
  }

  /**
   * 检查年龄是否在范围内
   */
  isAgeInRange(age, range) {
    const [min, max] = range.split('-').map(Number);
    const ageNum = parseInt(age);
    return ageNum >= min && ageNum <= max;
  }

  /**
   * 生成基于客户类型的详细角色设定
   */
  generateDetailedProfile(customerType, customizations = {}) {
    if (!this.porscheCustomerTypes[customerType]) {
      throw new Error(`未知的客户类型: ${customerType}`);
    }

    const baseType = this.porscheCustomerTypes[customerType];
    const profile = {
      customerType,
      description: baseType.description,
      ...baseType.characteristics,
      ...customizations // 允许自定义覆盖
    };

    return profile;
  }

  /**
   * 生成客户类型专用的AI提示词
   */
  generateCustomerTypePrompt(customerType, taskConfig = {}) {
    const profile = this.generateDetailedProfile(customerType);
    
    let prompt = `# 保时捷客户角色扮演 - ${customerType}

## 角色背景
你是一位${customerType}，${profile.description}。

## 核心特征
- **性格特点**: ${profile.personality.join('、')}
- **职业背景**: ${profile.profession[Math.floor(Math.random() * profile.profession.length)]}
- **沟通方式**: ${profile.communicationStyle}
- **决策特点**: ${profile.decisionMaking}
- **价格敏感度**: ${profile.priceSelection || profile.priceSelection}
- **年龄性别**: ${profile.ageRange}岁，${profile.gender}

## 关注重点
${profile.focusPoints.map(point => `- ${point}`).join('\n')}

## 兴趣爱好
${profile.hobbies.join('、')}

## 沟通风格
${profile.conversationStyle}

## 购买行为特征
${profile.purchaseBehavior}

## 社会影响因素
${profile.socialInfluence}

## 关键触发点
${profile.keyTriggers.map(trigger => `- ${trigger}`).join('\n')}

## 常见异议
${profile.objections.map(objection => `- ${objection}`).join('\n')}

## 购买信号
${profile.buyingSignals.map(signal => `- ${signal}`).join('\n')}

---

## 角色扮演指导

### 对话原则
1. **保持角色一致性**: 严格按照${customerType}的特征进行对话
2. **自然真实**: 像真实客户一样提问和回应，不要透露你是AI
3. **符合性格**: 体现${profile.communicationStyle}的沟通特点
4. **展现专业性**: 根据职业背景展现相应的专业知识和关注点

### 对话策略
- **开场方式**: ${this.generateOpeningStrategy(profile)}
- **提问风格**: ${this.generateQuestioningStyle(profile)}
- **异议表达**: ${this.generateObjectionStyle(profile)}
- **决策过程**: ${this.generateDecisionStyle(profile)}

### 特殊行为指令
${this.generateSpecialBehaviors(profile, taskConfig)}

请严格按照以上设定进行角色扮演，确保每一句话都符合${customerType}的身份和特征。`;

    return prompt;
  }

  /**
   * 生成开场策略
   */
  generateOpeningStrategy(profile) {
    const strategies = {
      'D控制型': '直接表达需求，时间宝贵，希望快速了解核心信息',
      'I影响型': '热情友好，可能会分享个人经历或朋友推荐',
      'C遵循型': '谨慎询问，希望获得详细准确的信息',
      'S稳定型': '温和礼貌，可能会表达一些犹豫或需要时间考虑'
    };
    return strategies[profile.communicationStyle] || '自然友好地开始对话';
  }

  /**
   * 生成提问风格
   */
  generateQuestioningStyle(profile) {
    const styles = {
      'D控制型': '直接提出关键问题，关注结果和效率',
      'I影响型': '通过故事和案例来提问，喜欢互动交流',
      'C遵循型': '详细询问技术参数和数据，要求准确信息',
      'S稳定型': '温和地提出疑虑，需要更多时间思考'
    };
    return styles[profile.communicationStyle] || '根据兴趣自然提问';
  }

  /**
   * 生成异议表达风格
   */
  generateObjectionStyle(profile) {
    const styles = {
      'D控制型': '直接表达不满或质疑，要求立即解决',
      'I影响型': '通过故事或他人经历来表达担忧',
      'C遵循型': '基于数据和事实提出质疑，要求详细解释',
      'S稳定型': '委婉表达担忧，需要更多保证和支持'
    };
    return styles[profile.communicationStyle] || '根据性格特点表达异议';
  }

  /**
   * 生成决策风格
   */
  generateDecisionStyle(profile) {
    const styles = {
      'D控制型': '快速决策，一旦确定就立即行动',
      'I影响型': '需要感觉良好，重视他人意见和推荐',
      'C遵循型': '需要充分信息和时间分析，谨慎决策',
      'S稳定型': '需要稳定感和保证，决策较为缓慢'
    };
    return styles[profile.communicationStyle] || '根据个人特点做决策';
  }

  /**
   * 生成特殊行为指令
   */
  generateSpecialBehaviors(profile, taskConfig) {
    let behaviors = [];
    
    // 根据训练重点添加特殊行为
    if (taskConfig.trainingFocus && taskConfig.trainingFocus.includes('沟通维度')) {
      behaviors.push(`- 严格体现${profile.communicationStyle}的沟通特点，测试销售顾问的沟通适应能力`);
    }
    
    if (taskConfig.trainingFocus && taskConfig.trainingFocus.includes('本品维度')) {
      behaviors.push(`- 重点询问${profile.focusPoints.slice(0, 2).join('和')}相关问题，测试产品知识深度`);
    }
    
    if (taskConfig.trainingFocus && taskConfig.trainingFocus.includes('竞品维度')) {
      behaviors.push('- 主动提及竞品对比，挑战销售顾问的竞品分析能力');
    }
    
    if (taskConfig.trainingFocus && taskConfig.trainingFocus.includes('客户信息获取维度')) {
      behaviors.push('- 适度隐藏个人信息，只有在销售顾问问对问题时才逐步透露');
    }
    
    // 根据客户类型添加特定行为
    if (profile.personality.includes('强势')) {
      behaviors.push('- 表现出强势和主导性，测试销售顾问的应对能力');
    }
    
    if (profile.personality.includes('理性')) {
      behaviors.push('- 要求详细数据和逻辑分析，质疑不够专业的回答');
    }
    
    if (profile.personality.includes('犹豫')) {
      behaviors.push('- 表现出犹豫和不确定，需要销售顾问的引导和说服');
    }
    
    return behaviors.length > 0 ? behaviors.join('\n') : '- 自然地体现客户类型特征，与销售顾问进行真实对话';
  }

  /**
   * 获取所有客户类型列表
   */
  getAllCustomerTypes() {
    return Object.keys(this.porscheCustomerTypes).map(typeName => ({
      name: typeName,
      description: this.porscheCustomerTypes[typeName].description,
      characteristics: this.porscheCustomerTypes[typeName].characteristics
    }));
  }

  /**
   * 根据客户类型生成随机配置
   */
  generateRandomConfigForType(customerType) {
    const profile = this.porscheCustomerTypes[customerType];
    if (!profile) return null;

    const chars = profile.characteristics;
    
    return {
      customerType,
      customerPersonality: chars.personality.slice(0, Math.floor(Math.random() * 3) + 1),
      customerProfession: chars.profession[Math.floor(Math.random() * chars.profession.length)],
      customerCommunication: chars.communicationStyle,
      customerHobbies: chars.hobbies.slice(0, Math.floor(Math.random() * 2) + 1),
      customerGender: chars.gender.includes('男性为主') ? '男' : chars.gender.includes('女性') ? '女' : ['男', '女'][Math.floor(Math.random() * 2)],
      customerAge: chars.ageRange,
      customerFocus: chars.focusPoints.slice(0, Math.floor(Math.random() * 3) + 1),
      // 可以根据客户类型添加更多默认配置
    };
  }

  /**
   * 验证客户配置的合理性
   */
  validateCustomerConfig(config) {
    const warnings = [];
    const suggestions = [];

    // 如果指定了客户类型，检查配置是否匹配
    if (config.customerType && this.porscheCustomerTypes[config.customerType]) {
      const expectedProfile = this.porscheCustomerTypes[config.customerType].characteristics;
      
      // 检查沟通方式匹配
      if (config.customerCommunication && config.customerCommunication !== expectedProfile.communicationStyle) {
        warnings.push(`${config.customerType}通常使用${expectedProfile.communicationStyle}沟通方式`);
      }
      
      // 检查性格特征匹配
      if (config.customerPersonality && config.customerPersonality.length > 0) {
        const unmatchedTraits = config.customerPersonality.filter(trait => 
          !expectedProfile.personality.includes(trait));
        if (unmatchedTraits.length > 0) {
          suggestions.push(`${config.customerType}更适合的性格特征：${expectedProfile.personality.join('、')}`);
        }
      }
      
      // 检查职业匹配
      if (config.customerProfession && !expectedProfile.profession.some(p => 
        p.includes(config.customerProfession) || config.customerProfession.includes(p))) {
        suggestions.push(`${config.customerType}常见职业：${expectedProfile.profession.join('、')}`);
      }
    }

    return { warnings, suggestions };
  }
}

module.exports = new CustomerProfileService();
