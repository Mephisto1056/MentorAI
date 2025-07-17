const aiCharacterService = require('./aiCharacterService');
const aiVoiceService = require('./aiVoiceService');
const aiEvaluationService = require('./aiEvaluationService');
const logger = require('../utils/logger');

class AIService {
  /**
   * 生成AI客户角色prompt
   */
  generateCustomerPrompt(taskConfig) {
    return aiCharacterService.generateCustomerPrompt(taskConfig);
  }

  /**
   * 生成客户响应
   */
  async generateCustomerResponse(conversation, customerProfile, taskConfig, aiPrompt = null) {
    return aiVoiceService.generateCustomerResponse(conversation, customerProfile, taskConfig, aiPrompt);
  }

  /**
   * 生成客户语音响应（文字+语音）
   */
  async generateCustomerVoiceResponse(conversation, customerProfile, taskConfig, enableVoice = true, aiPrompt = null) {
    return aiVoiceService.generateCustomerVoiceResponse(conversation, customerProfile, taskConfig, enableVoice, aiPrompt);
  }

  /**
   * 评估学员表现
   */
  async evaluatePerformance(conversation, evaluationCriteria) {
    return aiEvaluationService.evaluatePerformance(conversation, evaluationCriteria);
  }

  /**
   * 获取默认评估结果
   */
  getDefaultEvaluation(evaluationCriteria) {
    return aiEvaluationService.getDefaultEvaluation(evaluationCriteria);
  }

  /**
   * 生成优化的prompt
   */
  async generateOptimizedPrompt(taskConfig) {
    try {
      // 使用aiCharacterService生成基础prompt
      const result = aiCharacterService.generateCustomerPrompt(taskConfig);
      
      // 处理新的返回格式（包含prompt和customerType）
      if (typeof result === 'object' && result.prompt) {
        return {
          prompt: result.prompt,
          customerType: result.customerType
        };
      } else {
        // 兼容旧格式（只返回prompt字符串）
        return {
          prompt: result,
          customerType: null
        };
      }
    } catch (error) {
      logger.error('Optimized prompt generation error:', error);
      throw new Error('Failed to generate optimized prompt: ' + error.message);
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

      return await aiEvaluationService.generateResponse(messages, systemPrompt);
    } catch (error) {
      logger.error('AI report generation error:', error);
      return '报告生成失败，请稍后重试。';
    }
  }
}

module.exports = new AIService();
