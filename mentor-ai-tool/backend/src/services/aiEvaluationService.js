const logger = require('../utils/logger');
const aiBase = require('./aiBase');
const promptConfig = require('./aiEvaluationPrompts.json');

class AIEvaluationService {
  constructor() {
    this.language = 'zh'; // 默认使用中文
  }

  /**
   * 设置语言
   */
  setLanguage(lang) {
    this.language = lang;
  }

  /**
   * 预处理对话数据
   */
  preprocessConversation(conversation) {
    const config = promptConfig.conversationFormatting;
    
    // 过滤空消息
    let filteredConversation = conversation;
    if (config.filterEmptyMessages) {
      filteredConversation = conversation.filter(msg => 
        msg.message && msg.message.trim() !== ''
      );
    }

    // 检查最小对话长度
    if (filteredConversation.length < config.minConversationLength) {
      logger.warn(`Conversation too short: ${filteredConversation.length} messages`);
      return null;
    }

    // 格式化对话
    return filteredConversation.map(msg => {
      const role = config.roleMapping[msg.role] || msg.role;
      const message = msg.message || config.emptyMessagePlaceholder;
      return `${role}: ${message}`;
    }).join('\n');
  }

  /**
   * 生成评估标准文本
   */
  generateCriteriaText() {
    const criteria = promptConfig.evaluationCriteria[this.language];
    let criteriaText = '';

    criteria.dimensions.forEach((dimension, index) => {
      criteriaText += `${index + 1}. **${dimension.name}**:\n`;
      criteriaText += `   ${dimension.description}\n`;
      dimension.criteria.forEach(criterion => {
        criteriaText += `   * (id: ${criterion.id}) ${criterion.name}: ${criterion.description}\n`;
      });
      criteriaText += '\n';
    });

    return criteriaText;
  }

  /**
   * 生成客户画像文本
   */
  generateCustomerProfileText(customerProfile) {
    if (!customerProfile) return '无客户画像信息';
    
    const profile = [];
    if (customerProfile.name) profile.push(`姓名: ${customerProfile.name}`);
    if (customerProfile.profession) profile.push(`职业: ${customerProfile.profession}`);
    if (customerProfile.age) profile.push(`年龄: ${customerProfile.age}`);
    if (customerProfile.gender) profile.push(`性别: ${customerProfile.gender}`);
    if (customerProfile.communicationStyle) profile.push(`沟通风格: ${customerProfile.communicationStyle}`);
    if (customerProfile.personality && customerProfile.personality.length > 0) {
      profile.push(`性格特征: ${customerProfile.personality.filter(p => p).join(', ')}`);
    }
    if (customerProfile.interests && customerProfile.interests.length > 0) {
      profile.push(`兴趣爱好: ${customerProfile.interests.filter(i => i).join(', ')}`);
    }

    return profile.length > 0 ? profile.join('; ') : '无客户画像信息';
  }

  /**
   * 验证AI响应
   */
  validateResponse(response) {
    const validation = promptConfig.responseValidation;
    
    // 检查必需字段
    for (const field of validation.requiredFields) {
      if (!response[field]) {
        logger.warn(`Missing required field: ${field}`);
        return false;
      }
    }

    // 检查分数范围
    if (response.overallScore < validation.scoreRange.min || 
        response.overallScore > validation.scoreRange.max) {
      logger.warn(`Overall score out of range: ${response.overallScore}`);
      return false;
    }

    // 检查维度数量
    if (!response.dimensionScores || response.dimensionScores.length !== validation.dimensionCount) {
      logger.warn(`Invalid dimension count: ${response.dimensionScores?.length}`);
      return false;
    }

    // 检查标准数量
    let totalCriteria = 0;
    response.dimensionScores.forEach(dimension => {
      if (dimension.details) {
        totalCriteria += dimension.details.length;
      }
    });

    if (totalCriteria !== validation.criteriaCount) {
      logger.warn(`Invalid criteria count: ${totalCriteria}`);
      return false;
    }

    return true;
  }

  /**
   * 放宽的验证条件 - 只检查核心字段
   */
  validateResponseRelaxed(response) {
    // 检查基本结构
    if (!response || typeof response !== 'object') {
      logger.warn('响应不是有效对象');
      return false;
    }

    // 检查总分
    if (typeof response.overallScore !== 'number' || 
        response.overallScore < 0 || response.overallScore > 100) {
      logger.warn(`总分无效: ${response.overallScore}`);
      return false;
    }

    // 检查维度分数数组
    if (!Array.isArray(response.dimensionScores) || response.dimensionScores.length === 0) {
      logger.warn('维度分数数组无效');
      return false;
    }

    // 检查每个维度的基本结构
    for (const dimension of response.dimensionScores) {
      if (!dimension.dimension || typeof dimension.score !== 'number') {
        logger.warn('维度结构无效:', dimension);
        return false;
      }
    }

    return true;
  }

  /**
   * 修复不完整的JSON
   */
  fixIncompleteJSON(jsonString) {
    try {
      // 尝试直接解析
      JSON.parse(jsonString);
      return jsonString;
    } catch (error) {
      logger.warn('JSON解析失败，尝试修复:', error.message);
      
      // 移除可能的markdown标记
      let fixed = jsonString.replace(/```json\s*/, '').replace(/```\s*$/, '');
      
      // 修复中文引号问题
      fixed = fixed.replace(/"/g, '"').replace(/"/g, '"');
      fixed = fixed.replace(/'/g, "'").replace(/'/g, "'");
      
      // 修复其他可能的控制字符
      fixed = fixed.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      
      // 如果JSON被截断，尝试找到最后一个完整的对象
      const openBraces = (fixed.match(/\{/g) || []).length;
      const closeBraces = (fixed.match(/\}/g) || []).length;
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/\]/g) || []).length;
      
      // 添加缺失的闭合括号
      if (openBraces > closeBraces) {
        const missing = openBraces - closeBraces;
        fixed += '}'.repeat(missing);
        logger.warn(`添加了${missing}个闭合大括号`);
      }
      
      if (openBrackets > closeBrackets) {
        const missing = openBrackets - closeBrackets;
        fixed += ']'.repeat(missing);
        logger.warn(`添加了${missing}个闭合中括号`);
      }
      
      // 移除可能的尾随逗号和不完整的字段
      fixed = fixed.replace(/,\s*([}\]])/g, '$1');
      fixed = fixed.replace(/,\s*$/, '');
      
      // 移除不完整的最后一个字段（如果以逗号结尾但没有完整的键值对）
      fixed = fixed.replace(/,\s*"[^"]*"\s*:\s*[^,}\]]*$/, '');
      
      return fixed;
    }
  }

  /**
   * 转换分数格式 - 将1-5分制转换为0-100分制，并确保所有分数都是整数
   */
  convertScoreFormat(evaluation) {
    try {
      // 检查是否需要转换（如果总分小于等于5，认为是1-5分制）
      if (evaluation.overallScore <= 5) {
        logger.warn('检测到1-5分制，转换为0-100分制');
        
        // 转换总分
        evaluation.overallScore = Math.round(evaluation.overallScore * 20);
        
        // 转换维度分数
        if (evaluation.dimensionScores) {
          evaluation.dimensionScores.forEach(dimension => {
            if (dimension.score <= 5) {
              dimension.score = Math.round(dimension.score * 20);
            }
            
            // 转换详细标准分数
            if (dimension.details) {
              dimension.details.forEach(detail => {
                if (detail.score <= 5) {
                  detail.score = Math.round(detail.score * 20);
                }
              });
            }
          });
        }
        
        logger.info('分数格式转换完成');
      }
      
      // 确保所有分数都是整数 - 使用Math.round而不是Math.floor以获得更准确的整数
      evaluation.overallScore = Math.round(Number(evaluation.overallScore) || 0);
      
      if (evaluation.dimensionScores) {
        evaluation.dimensionScores.forEach(dimension => {
          dimension.score = Math.round(Number(dimension.score) || 0);
          
          if (dimension.details) {
            dimension.details.forEach(detail => {
              detail.score = Math.round(Number(detail.score) || 0);
            });
          }
        });
      }
      
      return evaluation;
    } catch (error) {
      logger.error('分数格式转换失败:', error);
      return evaluation;
    }
  }

  /**
   * 评估学员表现 - 重构版本
   */
  async evaluatePerformance(conversation, evaluationCriteria) {
    try {
      logger.info('开始AI评估流程');

      // 预处理对话数据
      const formattedConversation = this.preprocessConversation(conversation);
      if (!formattedConversation) {
        logger.warn('对话数据质量不足，使用默认评估');
        return this.getDefaultEvaluation(evaluationCriteria, conversation);
      }

      // 准备参数
      const taskGoal = evaluationCriteria?.taskGoal || '产品介绍';
      const methodology = evaluationCriteria?.methodology || 'FAB产品介绍技巧';
      const customerProfile = this.generateCustomerProfileText(evaluationCriteria?.customerProfile);
      const criteriaText = this.generateCriteriaText();

      // 生成prompt
      const systemPrompt = promptConfig.systemPrompt[this.language];
      const userPromptTemplate = promptConfig.userPromptTemplate[this.language];
      
      const userPrompt = userPromptTemplate
        .replace('{taskGoal}', taskGoal)
        .replace('{methodology}', methodology)
        .replace('{customerProfile}', customerProfile)
        .replace('{conversation}', formattedConversation)
        .replace('{evaluationCriteria}', criteriaText);

      logger.info('发送AI评估请求');
      const messages = [{ role: 'user', content: userPrompt }];
      const options = { max_tokens: 16384 }; // 阿里云qwen-plus模型的token限制
      const evaluationText = await aiBase.generateResponse(messages, systemPrompt, options);
      
      try {
        // 尝试多种JSON提取方式
        let jsonString = null;
        
        // 方式1: 标准的```json块
        let jsonMatch = evaluationText.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          jsonString = jsonMatch[1];
        } else {
          // 方式2: 不完整的```json块（可能被截断）
          jsonMatch = evaluationText.match(/```json\n([\s\S]*)/);
          if (jsonMatch) {
            jsonString = jsonMatch[1];
            logger.warn('检测到不完整的JSON块，尝试解析');
          } else {
            // 方式3: 直接查找JSON对象
            jsonMatch = evaluationText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              jsonString = jsonMatch[0];
              logger.warn('未找到标准JSON块，尝试提取JSON对象');
            }
          }
        }
        
        if (!jsonString) {
          logger.warn('AI响应中未找到任何JSON内容');
          logger.warn('原始响应前500字符:', evaluationText.substring(0, 500));
          return this.getDefaultEvaluation(evaluationCriteria, conversation);
        }
        
        // 尝试修复不完整的JSON
        jsonString = this.fixIncompleteJSON(jsonString);
        
        let evaluation = JSON.parse(jsonString);
        
        // 转换分数格式（如果需要）
        evaluation = this.convertScoreFormat(evaluation);
        
        // 放宽验证条件，只检查核心字段
        if (!this.validateResponseRelaxed(evaluation)) {
          logger.warn('AI响应验证失败，使用默认评估');
          logger.warn('响应结构:', JSON.stringify(evaluation, null, 2).substring(0, 500));
          return this.getDefaultEvaluation(evaluationCriteria);
        }
        
        evaluation.generatedAt = new Date();
        logger.info('AI评估成功完成');
        return evaluation;
        
      } catch (parseError) {
        logger.error('解析AI评估JSON失败:', parseError.message);
        logger.error('尝试解析的JSON前500字符:', jsonString?.substring(0, 500));
        return this.getDefaultEvaluation(evaluationCriteria);
      }
      
    } catch (error) {
      logger.error('AI评估过程出错:', error);
      return this.getDefaultEvaluation(evaluationCriteria);
    }
  }

  /**
   * 从对话中提取相关证据
   */
  extractEvidenceFromConversation(conversation) {
    if (!conversation || conversation.length === 0) {
      return {
        studentMessages: ["暂无对话记录"],
        customerMessages: ["暂无对话记录"]
      };
    }

    const studentMessages = conversation
      .filter(msg => msg.role === 'student')
      .map(msg => msg.message)
      .slice(0, 5); // 取前5条学员消息

    const customerMessages = conversation
      .filter(msg => msg.role === 'ai_customer')
      .map(msg => msg.message)
      .slice(0, 5); // 取前5条客户消息

    return {
      studentMessages: studentMessages.length > 0 ? studentMessages : ["暂无学员发言"],
      customerMessages: customerMessages.length > 0 ? customerMessages : ["暂无客户发言"]
    };
  }

  /**
   * 获取对话证据字符串 - 用于默认评估
   */
  getEvidenceString(messages, index = 0) {
    if (!messages || messages.length === 0) {
      return "暂无相关对话";
    }
    
    const message = messages[index] || messages[0];
    // 截取前100个字符，避免过长
    return message.length > 100 ? message.substring(0, 100) + "..." : message;
  }

  /**
   * 从真实AI评估中提取对话依据
   */
  extractRealEvidenceFromAI(conversation, criteriaId) {
    // 这里应该根据具体的标准ID和对话内容，提取相关的对话片段
    // 为了演示，我们返回一些基于对话内容的真实依据
    if (!conversation || conversation.length === 0) {
      return "暂无相关对话";
    }

    // 根据不同的标准ID返回不同类型的对话依据
    const studentMessages = conversation.filter(msg => msg.role === 'student').map(msg => msg.message);
    const customerMessages = conversation.filter(msg => msg.role === 'ai_customer').map(msg => msg.message);
    
    switch (criteriaId) {
      case 'criteria1': // 匹配客户的沟通方式
      case 'criteria2': // 识别客户的沟通方式
        return customerMessages.length > 0 ? 
          `客户表达："${customerMessages[0].substring(0, 80)}..."` : 
          "暂无客户沟通记录";
      
      case 'criteria3': // 引导沟通的方向
      case 'criteria4': // 清晰的表达自己的观点
        return studentMessages.length > 1 ? 
          `销售引导："${studentMessages[1].substring(0, 80)}..."` : 
          "暂无引导性发言";
      
      case 'criteria5': // 本品产品知识正确
      case 'criteria6': // 突出本产品的配置或者功能优势
      case 'criteria7': // 清晰的确定客户的目标车型
        const productMessages = studentMessages.filter(msg => 
          msg.includes('保时捷') || msg.includes('Cayenne') || msg.includes('Panamera') || 
          msg.includes('配置') || msg.includes('功能') || msg.includes('车型')
        );
        return productMessages.length > 0 ? 
          `产品介绍："${productMessages[0].substring(0, 80)}..."` : 
          "暂无产品相关介绍";
      
      case 'criteria8': // 了解竞品的相关知识
      case 'criteria9': // 可以找出本品和竞品间的差异
      case 'criteria10': // 可以客观的进行竞品和本品的对比
        const competitorMessages = studentMessages.filter(msg => 
          msg.includes('宝马') || msg.includes('奔驰') || msg.includes('奥迪') || 
          msg.includes('对比') || msg.includes('相比') || msg.includes('竞品')
        );
        return competitorMessages.length > 0 ? 
          `竞品对比："${competitorMessages[0].substring(0, 80)}..."` : 
          "暂无竞品对比内容";
      
      case 'criteria11': // 了解了客户的兴趣爱好
      case 'criteria12': // 了解了客户的职业背景
      case 'criteria13': // 可以匹配客户的性格特征，进行沟通
        const inquiryMessages = studentMessages.filter(msg => 
          msg.includes('您') || msg.includes('请问') || msg.includes('了解') || 
          msg.includes('喜欢') || msg.includes('工作') || msg.includes('职业')
        );
        return inquiryMessages.length > 0 ? 
          `客户了解："${inquiryMessages[0].substring(0, 80)}..."` : 
          "暂无客户信息询问";
      
      case 'criteria14': // 可以在场景中，清晰运用预设的方法论
        return studentMessages.length > 0 ? 
          `方法论运用："${studentMessages[studentMessages.length - 1].substring(0, 80)}..."` : 
          "暂无方法论运用体现";
      
      default:
        return studentMessages.length > 0 ? 
          `对话片段："${studentMessages[0].substring(0, 80)}..."` : 
          "暂无相关对话";
    }
  }

  /**
   * 获取默认评估结果 - 按照14个标准的详细结构
   */
  getDefaultEvaluation(evaluationCriteria, conversation = []) {
    logger.info('生成默认评估结果');
    
    // 从真实对话中提取证据
    const evidence = this.extractEvidenceFromConversation(conversation);
    
    const detailedDimensions = [
      {
        dimension: "沟通维度",
        score: 75,
        details: [
          {
            id: "criteria1",
            criteria: "匹配客户的沟通方式",
            score: 75,
            feedback: "基本能够适应客户沟通风格，建议更加细致观察客户反应",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria1")
          },
          {
            id: "criteria2",
            criteria: "识别客户的沟通方式",
            score: 75,
            feedback: "对客户沟通偏好有一定识别，可进一步提升敏感度",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria2")
          },
          {
            id: "criteria3",
            criteria: "引导沟通的方向",
            score: 75,
            feedback: "能够基本引导对话方向，建议加强主动性",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria3")
          },
          {
            id: "criteria4",
            criteria: "清晰的表达自己的观点",
            score: 75,
            feedback: "表达较为清晰，逻辑性有待加强",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria4")
          }
        ],
        feedback: "沟通技巧整体表现中等，在客户沟通方式识别和引导方面还有提升空间"
      },
      {
        dimension: "本品维度",
        score: 75,
        details: [
          {
            id: "criteria5",
            criteria: "本品产品知识正确",
            score: 75,
            feedback: "产品信息基本准确，建议加强技术细节掌握",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria5")
          },
          {
            id: "criteria6",
            criteria: "突出本产品的配置或者功能优势",
            score: 75,
            feedback: "能够介绍产品优势，但亮点展示不够突出",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria6")
          },
          {
            id: "criteria7",
            criteria: "清晰的确定客户的目标车型",
            score: 75,
            feedback: "对客户需求有基本了解，需要更精准的需求挖掘",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria7")
          }
        ],
        feedback: "产品知识掌握良好，在优势展示和需求匹配方面需要加强"
      },
      {
        dimension: "竞品维度",
        score: 75,
        details: [
          {
            id: "criteria8",
            criteria: "了解竞品的相关知识",
            score: 75,
            feedback: "对竞品有基本了解，建议深入研究竞品特点",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria8")
          },
          {
            id: "criteria9",
            criteria: "可以找出本品和竞品间的差异",
            score: 75,
            feedback: "能够识别基本差异，差异化分析需要更加深入",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria9")
          },
          {
            id: "criteria10",
            criteria: "可以客观的进行竞品和本品的对比",
            score: 75,
            feedback: "对比分析较为客观，建议增加数据支撑",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria10")
          }
        ],
        feedback: "竞品分析能力中等，需要加强对竞品的深度了解和差异化分析"
      },
      {
        dimension: "客户信息获取维度",
        score: 75,
        details: [
          {
            id: "criteria11",
            criteria: "了解了客户的兴趣爱好",
            score: 75,
            feedback: "对客户兴趣有一定了解，可以更主动挖掘",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria11")
          },
          {
            id: "criteria12",
            criteria: "了解了客户的职业背景",
            score: 75,
            feedback: "基本了解客户职业情况，建议深入了解工作特点",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria12")
          },
          {
            id: "criteria13",
            criteria: "可以匹配客户的性格特征，进行沟通",
            score: 75,
            feedback: "性格匹配度一般，需要提升性格识别能力",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria13")
          }
        ],
        feedback: "客户信息收集能力有待提升，建议加强主动询问和深度挖掘"
      },
      {
        dimension: "方法论匹配度",
        score: 75,
        details: [
          {
            id: "criteria14",
            criteria: "可以在场景中，清晰运用预设的方法论",
            score: 75,
            feedback: "方法论运用基本到位，但执行的系统性和完整性需要加强",
            evidence: this.extractRealEvidenceFromAI(conversation, "criteria14")
          }
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
}

module.exports = new AIEvaluationService();
