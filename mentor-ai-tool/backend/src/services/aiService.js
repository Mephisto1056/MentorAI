const axios = require('axios');
const logger = require('../utils/logger');
const customerProfileService = require('./customerProfileService');
const voiceService = require('./voiceService');

class AIService {
  constructor() {
    // 支持多种AI服务提供商
    this.provider = process.env.AI_PROVIDER || 'alicloud'; // 'openai' | 'alicloud'
    
    // OpenAI配置
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openaiBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    
    // 阿里云配置
    this.alicloudApiKey = process.env.ALICLOUD_API_KEY;
    this.alicloudBaseUrl = process.env.ALICLOUD_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1';
    this.alicloudModel = process.env.ALICLOUD_MODEL || 'qwen-turbo';
    
    this.validateConfig();
  }

  validateConfig() {
    if (this.provider === 'openai' && !this.openaiApiKey) {
      logger.warn('OpenAI API key not configured');
    }
    if (this.provider === 'alicloud' && !this.alicloudApiKey) {
      logger.warn('Alicloud API key not configured');
    }
  }

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
        // 降级到基础提示词
      }
    }
    
    // 智能推荐客户类型
    if (!config.customerType && (config.customerProfession || config.customerPersonality || config.customerFocus)) {
      try {
        const recommendation = customerProfileService.recommendCustomerType({
          profession: config.customerProfession,
          personality: config.customerPersonality,
          focusPoints: config.customerFocus,
          communicationStyle: config.customerCommunication,
          age: config.customerAge
        });
        
        if (recommendation.confidence > 0.3) {
          logger.info(`Auto-recommended customer type: ${recommendation.recommendedType} (confidence: ${recommendation.confidence})`);
          return customerProfileService.generateCustomerTypePrompt(recommendation.recommendedType, config);
        }
      } catch (error) {
        logger.warn('Failed to auto-recommend customer type:', error);
      }
    }
    
    // 基础角色设定（兼容旧版本）
    let prompt = `你是一个汽车销售场景中的模拟客户，请根据以下设定进行角色扮演：

## 任务目标
${config.taskGoal || '产品咨询'}

## 销售方法论
${config.methodology || '常规销售'}

## 客户背景设定
- 性格特征: ${config.customerPersonality?.join('、') || '理性客观'}
- 职业背景: ${config.customerProfession || '普通消费者'}
- 沟通方式: ${config.customerCommunication || '直接明了'}
- 兴趣爱好: ${config.customerHobbies?.join('、') || '无特殊爱好'}
- 年龄性别: ${config.customerGender || ''} ${config.customerAge || '30-40岁'}

## 本品维度
- 现驾车型: ${config.currentVehicle || '无'}
- 意向车型: ${config.interestedVehicle || '待定'}
- 关注重点: ${config.customerFocus?.join('、') || '价格和性能'}

## 竞品维度
- 现驾车型: ${config.competitorCurrent || '无'}
- 意向车型: ${config.competitorInterested || '无'}
- 关注重点: ${config.competitorFocus?.join('、') || '价格对比'}

## 交易相关
- 洽谈环节: ${config.negotiationStage || '初步了解'}
- 交易关注点: ${config.transactionConcerns?.join('、') || '价格和服务'}

请保持角色一致性，根据设定的性格和背景进行自然对话。不要透露你是AI，要像真实客户一样提问和回应。`;

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
- 重点询问产品的具体配置、功能、优势
- 测试销售顾问的产品知识深度
- 对产品介绍的准确性和专业性提出质疑`;
      }
      
      if (config.trainingFocus.includes('竞品维度')) {
        prompt += `\n### 竞品维度训练
- 主动提及竞品对比，询问差异化优势
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

  /**
   * 调用阿里云通义千问API
   */
  async callAlicloudAPI(messages, systemPrompt = '') {
    try {
      if (!this.alicloudApiKey) {
        throw new Error('Alicloud API key not configured');
      }

      const requestData = {
        model: this.alicloudModel,
        input: {
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...messages
          ]
        },
        parameters: {
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.8
        }
      };

      const response = await axios.post(`${this.alicloudBaseUrl}/services/aigc/text-generation/generation`, requestData, {
        headers: {
          'Authorization': `Bearer ${this.alicloudApiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-SSE': 'disable'
        },
        timeout: 30000
      });

      if (response.data.output && response.data.output.text) {
        return response.data.output.text.trim();
      } else {
        throw new Error('No response from Alicloud API');
      }
    } catch (error) {
      logger.error('Alicloud API error:', error.response?.data || error.message);
      throw new Error('AI service temporarily unavailable');
    }
  }

  /**
   * 调用OpenAI API
   */
  async callOpenAIAPI(messages, systemPrompt = '') {
    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const requestData = {
        model: 'gpt-3.5-turbo',
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          ...messages
        ],
        max_tokens: 500,
        temperature: 0.7
      };

      const response = await axios.post(`${this.openaiBaseUrl}/chat/completions`, requestData, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      } else {
        throw new Error('No response from OpenAI API');
      }
    } catch (error) {
      logger.error('OpenAI API error:', error.response?.data || error.message);
      throw new Error('AI service temporarily unavailable');
    }
  }

  /**
   * 统一的AI响应生成接口
   */
  async generateResponse(messages, systemPrompt = '') {
    try {
      if (this.provider === 'alicloud') {
        return await this.callAlicloudAPI(messages, systemPrompt);
      } else if (this.provider === 'openai') {
        return await this.callOpenAIAPI(messages, systemPrompt);
      } else {
        throw new Error(`Unsupported AI provider: ${this.provider}`);
      }
    } catch (error) {
      logger.error('AI response generation error:', error);
      
      // 降级处理：如果主要服务失败，尝试备用服务
      if (this.provider === 'alicloud' && this.openaiApiKey) {
        logger.info('Falling back to OpenAI API');
        try {
          return await this.callOpenAIAPI(messages, systemPrompt);
        } catch (fallbackError) {
          logger.error('Fallback OpenAI API also failed:', fallbackError);
        }
      }
      
      // 返回默认响应
      return this.getDefaultResponse();
    }
  }

  /**
   * 生成客户响应
   */
  async generateCustomerResponse(conversation, customerProfile, taskConfig) {
    try {
      const systemPrompt = this.generateCustomerPrompt(taskConfig);
      
      // 转换对话格式
      const messages = conversation.map(msg => ({
        role: msg.role === 'student' ? 'user' : 'assistant',
        content: msg.message
      }));

      return await this.generateResponse(messages, systemPrompt);
    } catch (error) {
      logger.error('Customer response generation error:', error);
      return '抱歉，我需要一点时间思考。请继续介绍您的产品。';
    }
  }

  /**
   * 生成客户语音响应（文字+语音）
   */
  async generateCustomerVoiceResponse(conversation, customerProfile, taskConfig, enableVoice = true) {
    try {
      // 首先生成文字响应
      const textResponse = await this.generateCustomerResponse(conversation, customerProfile, taskConfig);
      
      const result = {
        text: textResponse,
        timestamp: new Date(),
        customerProfile: customerProfile
      };

      // 如果启用语音，生成语音
      if (enableVoice) {
        try {
          const voiceResponse = await voiceService.generateCustomerVoiceResponse(textResponse, customerProfile);
          result.voice = voiceResponse.voice;
          result.voiceProfile = voiceResponse.voiceProfile;
        } catch (voiceError) {
          logger.warn('Voice generation failed, using text only:', voiceError);
          result.voice = {
            success: false,
            fallback: true,
            error: 'Voice generation failed',
            source: 'error'
          };
        }
      }

      return result;
    } catch (error) {
      logger.error('Customer voice response generation error:', error);
      return {
        text: '抱歉，我需要一点时间思考。请继续介绍您的产品。',
        voice: {
          success: false,
          fallback: true,
          error: 'Response generation failed'
        },
        timestamp: new Date(),
        customerProfile: customerProfile
      };
    }
  }

  /**
   * 评估学员表现 - 按照14个具体标准进行评估
   */
  async evaluatePerformance(conversation, evaluationCriteria) {
    try {
      // 构建详细的评估标准
      const detailedCriteria = {
        "沟通维度": [
          "匹配客户的沟通方式",
          "识别客户的沟通方式", 
          "引导沟通的方向",
          "清晰的表达自己的观点"
        ],
        "本品维度": [
          "本品产品知识正确",
          "突出本产品的配置或者功能优势",
          "清晰的确定客户的目标车型"
        ],
        "竞品维度": [
          "了解竞品的相关知识",
          "可以找出本品和竞品间的差异",
          "可以客观的进行竞品和本品的对比"
        ],
        "客户信息获取维度": [
          "了解了客户的兴趣爱好",
          "了解了客户的职业背景",
          "可以匹配客户的性格特征，进行沟通"
        ],
        "方法论匹配度": [
          "可以在场景中，清晰运用预设的方法论"
        ]
      };

      const taskGoal = evaluationCriteria?.taskGoal || '产品介绍';
      const methodology = evaluationCriteria?.methodology || 'FAB产品介绍技巧';
      const customerProfile = evaluationCriteria?.customerProfile || {};

      const evaluationPrompt = `请作为专业的汽车销售培训师，根据以下对话内容对销售顾问的表现进行详细评估。

## 任务背景
- 任务目标：${taskGoal}
- 方法论：${methodology}
- 客户背景：${JSON.stringify(customerProfile, null, 2)}

## 对话内容
${conversation.map(msg => `${msg.role === 'student' ? '销售顾问' : '客户'}：${msg.message}`).join('\n')}

## 评估指令
请严格按照下面的14个细则，对销售顾问的表现进行逐一打分和评价。

### 评估标准
请为以下每个细则评分，并提供id。
1.  **沟通维度**:
    *   (id: criteria1) 匹配客户的沟通方式: 是否根据客户性格调整沟通风格。
    *   (id: criteria2) 识别客户的沟通方式: 是否准确识别客户的沟通偏好。
    *   (id: criteria3) 引导沟通的方向: 是否有效引导对话朝目标方向发展。
    *   (id: criteria4) 清晰的表达自己的观点: 表达是否清晰、逻辑性强。
2.  **本品维度**:
    *   (id: criteria5) 本品产品知识正确: 产品信息是否准确无误。
    *   (id: criteria6) 突出本产品的配置或者功能优势: 是否有效展示产品亮点。
    *   (id: criteria7) 清晰的确定客户的目标车型: 是否明确客户真实需求。
3.  **竞品维度**:
    *   (id: criteria8) 了解竞品的相关知识: 对竞争对手产品的了解程度。
    *   (id: criteria9) 可以找出本品和竞品间的差异: 差异化分析能力。
    *   (id: criteria10) 可以客观的进行竞品和本品的对比: 对比分析的客观性。
4.  **客户信息获取维度**:
    *   (id: criteria11) 了解了客户的兴趣爱好: 是否挖掘客户个人兴趣。
    *   (id: criteria12) 了解了客户的职业背景: 是否了解客户工作情况。
    *   (id: criteria13) 可以匹配客户的性格特征，进行沟通: 性格匹配度。
5.  **方法论匹配度**:
    *   (id: criteria14) 可以在场景中，清晰运用预设的方法论: ${methodology}的运用情况。

### 输出要求
你必须返回一个严格符合以下描述的JSON对象，不要添加任何额外的解释或注释。

\`\`\`json
{
  "overallScore": <总平均分, 整数>,
  "dimensionScores": [
    {
      "dimension": "<维度名称>",
      "score": <该维度平均分, 整数>,
      "feedback": "<对该维度的总体评价>",
      "details": [
        {
          "id": "<criteria_id>",
          "criteria": "<具体细则名称>",
          "score": <该细则得分, 0-100的整数>,
          "feedback": "<对该细则的具体分析和建议>",
          "evidence": "<从对话中截取一段最能支撑你评分的原文，不超过50字，如果无相关对话则留空字符串>"
        }
      ]
    }
  ],
  "suggestions": [
    "<具体的、可操作的改进建议1>",
    "<具体的、可操作的改进建议2>"
  ],
  "strengths": [
    "<表现优秀、值得保持的方面1>",
    "<表现优秀、值得保持的方面2>"
  ]
}
\`\`\`

### 评分指南
-   **评分**: 90-100优秀, 80-89良好, 70-79中等, 60-69及格, 60以下不及格。
-   **Feedback**: 必须具体、有建设性，并结合实际对话内容。
-   **Evidence**: 必须是对话原文的直接引用，用于支撑你的评分。这是强制性的。
-   **JSON有效性**: 确保返回的是一个可以被直接解析的、完整的JSON对象。`;

      const messages = [
        { role: 'user', content: evaluationPrompt }
      ];

      const systemPrompt = `你是一位资深的汽车销售培训专家，拥有丰富的销售技能评估经验。请严格按照14个评估标准进行详细分析，确保评估结果客观、准确、有指导意义。必须返回有效的JSON格式。`;

      const evaluationText = await this.generateResponse(messages, systemPrompt);
      
      try {
        // 尝试解析JSON响应
        let evaluation = JSON.parse(evaluationText);
        evaluation.generatedAt = new Date();
        
        // 验证评估结果的完整性
        if (!evaluation.dimensionScores || evaluation.dimensionScores.length === 0) {
          logger.warn('AI evaluation incomplete, using default structure');
          evaluation = this.getDefaultEvaluation(evaluationCriteria);
        }
        
        return evaluation;
      } catch (parseError) {
        logger.error('Failed to parse AI evaluation JSON:', parseError);
        logger.error('Raw AI response:', evaluationText);
        
        // 返回默认评估
        return this.getDefaultEvaluation(evaluationCriteria);
      }
    } catch (error) {
      logger.error('AI evaluation error:', error);
      return this.getDefaultEvaluation(evaluationCriteria);
    }
  }

  /**
   * 生成分析报告
   */
  async generateAnalyticsReport(data) {
    try {
      const reportPrompt = `基于以下销售培训数据，生成分析报告：

数据概览：
- 总学员数：${data.totalStudents}
- 总练习次数：${data.totalSessions}
- 平均完成率：${data.averageCompletionRate}%
- 平均得分：${data.averageScore}

请生成一份包含以下内容的分析报告：
1. 整体表现分析
2. 主要问题识别
3. 改进建议
4. 培训重点建议

报告应该专业、具体且有指导意义。`;

      const messages = [
        { role: 'user', content: reportPrompt }
      ];

      const systemPrompt = '你是一位资深的销售培训专家，擅长分析培训数据并提供专业建议。';

      return await this.generateResponse(messages, systemPrompt);
    } catch (error) {
      logger.error('AI report generation error:', error);
      return '报告生成失败，请稍后重试。';
    }
  }

  /**
   * 获取默认响应
   */
  getDefaultResponse() {
    const responses = [
      '我对这个产品很感兴趣，能详细介绍一下吗？',
      '价格方面有什么优惠吗？',
      '这款车和竞品相比有什么优势？',
      '我需要考虑一下，有什么其他信息可以提供吗？'
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * 获取默认评估结果 - 按照14个标准的详细结构
   */
  getDefaultEvaluation(evaluationCriteria) {
    const detailedDimensions = [
      {
        dimension: "沟通维度",
        score: 75,
        details: [
          { criteria: "匹配客户的沟通方式", score: 75, feedback: "基本能够适应客户沟通风格，建议更加细致观察客户反应" },
          { criteria: "识别客户的沟通方式", score: 75, feedback: "对客户沟通偏好有一定识别，可进一步提升敏感度" },
          { criteria: "引导沟通的方向", score: 75, feedback: "能够基本引导对话方向，建议加强主动性" },
          { criteria: "清晰的表达自己的观点", score: 75, feedback: "表达较为清晰，逻辑性有待加强" }
        ],
        feedback: "沟通技巧整体表现中等，在客户沟通方式识别和引导方面还有提升空间"
      },
      {
        dimension: "本品维度", 
        score: 75,
        details: [
          { criteria: "突出本产品的配置或者功能优势", score: 75, feedback: "能够介绍产品优势，但亮点展示不够突出" },
          { criteria: "清晰的确定客户的目标车型", score: 75, feedback: "对客户需求有基本了解，需要更精准的需求挖掘" }
        ],
        feedback: "产品知识掌握良好，在优势展示和需求匹配方面需要加强"
      },
      {
        dimension: "竞品维度",
        score: 75, 
        details: [
          { criteria: "了解竞品的相关知识", score: 75, feedback: "对竞品有基本了解，建议深入研究竞品特点" },
          { criteria: "可以找出本品和竞品间的差异", score: 75, feedback: "能够识别基本差异，差异化分析需要更加深入" },
          { criteria: "可以客观的进行竞品和本品的对比", score: 75, feedback: "对比分析较为客观，建议增加数据支撑" }
        ],
        feedback: "竞品分析能力中等，需要加强对竞品的深度了解和差异化分析"
      },
      {
        dimension: "客户信息获取维度",
        score: 75,
        details: [
          { criteria: "了解了客户的兴趣爱好", score: 75, feedback: "对客户兴趣有一定了解，可以更主动挖掘" },
          { criteria: "了解了客户的职业背景", score: 75, feedback: "基本了解客户职业情况，建议深入了解工作特点" },
          { criteria: "可以匹配客户的性格特征，进行沟通", score: 75, feedback: "性格匹配度一般，需要提升性格识别能力" }
        ],
        feedback: "客户信息收集能力有待提升，建议加强主动询问和深度挖掘"
      },
      {
        dimension: "方法论匹配度",
        score: 75,
        details: [
          { criteria: "可以在场景中，清晰运用预设的方法论", score: 75, feedback: "方法论运用基本到位，但执行的系统性和完整性需要加强" }
        ],
        feedback: "销售方法论的运用需要更加系统化和规范化"
      }
    ];
    
    return {
      overallScore: 75,
      dimensionScores: detailedDimensions,
      suggestions: [
        "加强客户沟通方式的识别和适应能力",
        "深入学习产品知识，特别是技术细节和竞争优势", 
        "提升主动询问和信息挖掘的技巧",
        "系统化运用销售方法论，确保每个步骤的完整执行"
      ],
      strengths: [
        "基本的产品介绍能力",
        "良好的沟通态度",
        "对客户需求的基本理解"
      ],
      generatedAt: new Date()
    };
  }
  /**
   * 生成智能优化的prompt - 集成保时捷客户类型系统
   */
  async generateOptimizedPrompt(taskConfig) {
    try {
      // 智能推荐最匹配的保时捷客户类型
      let recommendedType = null;
      let confidence = 0;
      
      if (taskConfig.customerProfession || taskConfig.customerPersonality?.length > 0 || taskConfig.customerFocus?.length > 0) {
        try {
          const recommendation = customerProfileService.recommendCustomerType({
            profession: taskConfig.customerProfession,
            personality: taskConfig.customerPersonality,
            focusPoints: taskConfig.customerFocus,
            communicationStyle: taskConfig.customerCommunication,
            age: taskConfig.customerAge
          });
          
          if (recommendation.confidence > 0.3) {
            recommendedType = recommendation.recommendedType;
            confidence = recommendation.confidence;
            logger.info(`Auto-recommended customer type: ${recommendedType} (confidence: ${confidence})`);
          }
        } catch (error) {
          logger.warn('Failed to auto-recommend customer type:', error);
        }
      }
      
      // 如果有推荐的客户类型，使用专业的客户类型提示词
      if (recommendedType) {
        try {
          const optimizedPrompt = customerProfileService.generateCustomerTypePrompt(recommendedType, taskConfig);
          
          // 添加智能优化标识
          const enhancedPrompt = `${optimizedPrompt}

## 🤖 AI智能优化
- 系统自动匹配客户类型：**${recommendedType}**
- 匹配置信度：${Math.round(confidence * 100)}%
- 该客户类型的特征已自动融入角色设定中

---
*本prompt已通过保时捷十大客户类型系统智能优化，提供更真实的客户行为模拟*`;

          return enhancedPrompt;
        } catch (error) {
          logger.warn(`Failed to generate optimized prompt for ${recommendedType}:`, error);
        }
      }
      
      // 降级到基础prompt生成
      const basicPrompt = this.generateCustomerPrompt(taskConfig);
      
      return `${basicPrompt}

## 🤖 AI智能优化
- 使用基础角色设定模式
- 建议完善客户信息以获得更精准的角色匹配

---
*提示：填写更多客户信息可获得基于保时捷十大客户类型的智能优化*`;
      
    } catch (error) {
      logger.error('Optimized prompt generation error:', error);
      
      // 错误时返回基础prompt
      const fallbackPrompt = this.generateCustomerPrompt(taskConfig);
      return `${fallbackPrompt}

## ⚠️ 提示
智能优化暂时不可用，使用基础角色设定模式。`;
    }
  }
}

module.exports = new AIService();
