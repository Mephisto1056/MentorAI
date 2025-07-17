const logger = require('../utils/logger');
const voiceService = require('./voiceService');
const aiCharacterService = require('./aiCharacterService');
const aiBase = require('./aiBase');

class AIVoiceService {
  /**
   * 生成客户响应
   */
  async generateCustomerResponse(conversation, customerProfile, taskConfig, aiPrompt = null) {
    try {
      // 如果传递了aiPrompt，优先使用；否则生成新的prompt
      let systemPrompt;
      if (aiPrompt) {
        logger.info('Using provided AI prompt for customer response');
        systemPrompt = aiPrompt;
      } else {
        logger.info('Generating new prompt from task config');
        const promptResult = aiCharacterService.generateCustomerPrompt(taskConfig);
        // 处理新的返回格式（包含prompt和customerType）
        systemPrompt = typeof promptResult === 'object' ? promptResult.prompt : promptResult;
      }
      
      // 转换对话格式
      const messages = conversation.map(msg => ({
        role: msg.role === 'student' ? 'user' : 'assistant',
        content: msg.message
      }));

      return await aiBase.generateResponse(messages, systemPrompt);
    } catch (error) {
      logger.error('Customer response generation error:', error);
      return '抱歉，我需要一点时间思考。请继续介绍您的产品。';
    }
  }

  /**
   * 生成客户语音响应（文字+语音）
   */
  async generateCustomerVoiceResponse(conversation, customerProfile, taskConfig, enableVoice = true, aiPrompt = null) {
    try {
      // 首先生成文字响应，传递aiPrompt参数
      const textResponse = await this.generateCustomerResponse(conversation, customerProfile, taskConfig, aiPrompt);
      
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
}

module.exports = new AIVoiceService();
