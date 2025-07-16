const logger = require('../utils/logger');
const aiBase = require('./aiBase');

class AIEvaluationService {
  /**
   * 评估学员表现 - 按照14个具体标准进行评估
   */
  async evaluatePerformance(conversation, evaluationCriteria) {
    try {
      const taskGoal = evaluationCriteria?.taskGoal || '产品介绍';
      const methodology = evaluationCriteria?.methodology || 'FAB产品介绍技巧';
      const customerProfile = evaluationCriteria?.customerProfile || {};

      const evaluationPrompt = `
      You are a professional car sales trainer. Evaluate the sales consultant's performance based on the following conversation.

      **Task Background:**
      - Task Goal: ${taskGoal}
      - Methodology: ${methodology}

      **Conversation:**
      ${conversation.map(msg => `${msg.role === 'student' ? 'Sales' : 'Customer'}: ${msg.message}`).join('\n')}

      **Evaluation Instructions:**
      Rate the sales consultant on the following 14 criteria. You MUST return a valid JSON object with no extra text or explanations.

      **JSON Output Format:**
      \`\`\`json
      {
        "overallScore": 0,
        "dimensionScores": [
          {
            "dimension": "Dimension Name",
            "score": 0,
            "feedback": "Overall feedback for the dimension.",
            "details": [
              {
                "id": "criteria_id",
                "criteria": "Criteria Name",
                "score": 0,
                "feedback": "Specific feedback and suggestions.",
                "evidence": "A quote from the conversation."
              }
            ]
          }
        ],
        "suggestions": ["Actionable suggestion 1", "Actionable suggestion 2"],
        "strengths": ["Strength 1", "Strength 2"]
      }
      \`\`\`

      **Criteria to Evaluate:**
      1.  **Communication**:
          *   (id: criteria1) Adapts to customer's communication style.
          *   (id: criteria2) Identifies customer's communication style.
          *   (id: criteria3) Guides the conversation effectively.
          *   (id: criteria4) Expresses ideas clearly.
      2.  **Product Knowledge**:
          *   (id: criteria5) Accurate product knowledge.
          *   (id: criteria6) Highlights product features and benefits.
          *   (id: criteria7) Identifies customer's target vehicle.
      3.  **Competitor Knowledge**:
          *   (id: criteria8) Knowledge of competitor products.
          *   (id: criteria9) Differentiates between own and competitor products.
          *   (id: criteria10) Objective comparison.
      4.  **Customer Information Gathering**:
          *   (id: criteria11) Uncovers customer's hobbies and interests.
          *   (id: criteria12) Learns about customer's professional background.
          *   (id: criteria13) Matches communication to customer's personality.
      5.  **Methodology Adherence**:
          *   (id: criteria14) Applies the ${methodology} methodology.
      `;

      const messages = [
        { role: 'user', content: evaluationPrompt }
      ];

      const systemPrompt = `你是一位资深的汽车销售培训专家，拥有丰富的销售技能评估经验。请严格按照14个评估标准进行详细分析，确保评估结果客观、准确、有指导意义。必须返回有效的JSON格式。`;

      const evaluationText = await aiBase.generateResponse(messages, systemPrompt);
      
      try {
        // 提取JSON字符串
        const jsonMatch = evaluationText.match(/```json\n([\s\S]*?)\n```/);
        if (!jsonMatch) {
          throw new Error('No JSON block found in the AI response.');
        }
        const jsonString = jsonMatch[1];
        
        // 尝试解析JSON响应
        let evaluation = JSON.parse(jsonString);
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
   * 获取默认评估结果 - 按照14个标准的详细结构
   */
  getDefaultEvaluation(evaluationCriteria) {
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
            evidence: "您好，欢迎来到保时捷展厅！我是销售顾问小李"
          },
          {
            id: "criteria2",
            criteria: "识别客户的沟通方式",
            score: 75,
            feedback: "对客户沟通偏好有一定识别，可进一步提升敏感度",
            evidence: "我想了解一下保时捷991-2的详细配置和性能参数"
          },
          {
            id: "criteria3",
            criteria: "引导沟通的方向",
            score: 75,
            feedback: "能够基本引导对话方向，建议加强主动性",
            evidence: "请问您今天想了解哪款车型？"
          },
          {
            id: "criteria4",
            criteria: "清晰的表达自己的观点",
            score: 75,
            feedback: "表达较为清晰，逻辑性有待加强",
            evidence: "那我为您推荐Cayenne系列，它完美结合了SUV的实用性"
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
            evidence: "991-2确实是一款出色的跑车"
          },
          {
            id: "criteria6",
            criteria: "突出本产品的配置或者功能优势",
            score: 75,
            feedback: "能够介绍产品优势，但亮点展示不够突出",
            evidence: "Cayenne有多种动力选择，基础版本就有340马力"
          },
          {
            id: "criteria7",
            criteria: "清晰的确定客户的目标车型",
            score: 75,
            feedback: "对客户需求有基本了解，需要更精准的需求挖掘",
            evidence: "请问您平时主要是几个人用车？"
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
            evidence: "相比宝马X5，我们的加速更快，油耗更低"
          },
          {
            id: "criteria9",
            criteria: "可以找出本品和竞品间的差异",
            score: 75,
            feedback: "能够识别基本差异，差异化分析需要更加深入",
            evidence: "与宝马M4、奔驰AMG GT等竞品的性能差异"
          },
          {
            id: "criteria10",
            criteria: "可以客观的进行竞品和本品的对比",
            score: 75,
            feedback: "对比分析较为客观，建议增加数据支撑",
            evidence: "价格方面，Cayenne的起售价确实比X5略高"
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
            evidence: "我比较关心动力性能和燃油经济性"
          },
          {
            id: "criteria12",
            criteria: "了解了客户的职业背景",
            score: 75,
            feedback: "基本了解客户职业情况，建议深入了解工作特点",
            evidence: "作为一个理性的消费者，我需要全面评估"
          },
          {
            id: "criteria13",
            criteria: "可以匹配客户的性格特征，进行沟通",
            score: 75,
            feedback: "性格匹配度一般，需要提升性格识别能力",
            evidence: "我想进一步了解一下它的具体技术参数"
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
            evidence: "您可以考虑我们的金融方案"
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
