const axios = require('axios');
const logger = require('../utils/logger');

class AIBase {
  constructor() {
    // 支持多种AI服务提供商
    this.provider = process.env.AI_PROVIDER || 'alicloud'; // 'openai' | 'alicloud' | 'kimi'
    
    // OpenAI配置
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openaiBaseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    
    // 阿里云配置
    this.alicloudApiKey = process.env.ALICLOUD_API_KEY;
    this.alicloudBaseUrl = process.env.ALICLOUD_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1';
    this.alicloudModel = process.env.ALICLOUD_MODEL || 'qwen-turbo';

    // Kimi配置
    this.kimiApiKey = process.env.KIMI_API_KEY;
    this.kimiBaseUrl = process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1';
    this.kimiModel = process.env.KIMI_MODEL || 'moonshot-v1-8k';
    
  }

  /**
   * 调用阿里云通义千问API
   */
  async callAlicloudAPI(messages, systemPrompt = '', options = {}) {
    logger.info(`Using Alicloud API Key: ${this.alicloudApiKey}`);
    if (!this.alicloudApiKey) {
      throw new Error('Alicloud API key not configured');
    }

    // 确保systemPrompt是字符串
    const promptText = typeof systemPrompt === 'object' ? systemPrompt.prompt : systemPrompt;

    const requestData = {
      model: this.alicloudModel,
      input: {
        messages: [
          ...(promptText ? [{ role: 'system', content: promptText }] : []),
          ...messages
        ]
      },
      parameters: {
        max_tokens: options.max_tokens || 16384,
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.8
      }
    };

    const http = require('http');
    const https = require('https');

    const response = await axios.post(`${this.alicloudBaseUrl}/services/aigc/text-generation/generation`, requestData, {
      headers: {
        'Authorization': `Bearer ${this.alicloudApiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-SSE': 'disable'
      },
      timeout: 60000,
      httpAgent: new http.Agent({ keepAlive: false }),
      httpsAgent: new https.Agent({ keepAlive: false }),
    });

    if (response.data.output && response.data.output.text) {
      return response.data.output.text.trim();
    } else {
      logger.error('Unexpected response structure from Alicloud API:', response.data);
      throw new Error('No response from Alicloud API');
    }
  }

  /**
   * 调用OpenAI API
   */
  async callOpenAIAPI(messages, systemPrompt = '', options = {}) {
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
        max_tokens: options.max_tokens || 131072,
        temperature: options.temperature || 0.7
      };

      const response = await axios.post(`${this.openaiBaseUrl}/chat/completions`, requestData, {
        headers: {
          'Authorization': `Bearer ${this.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
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
   * 调用Kimi API
   */
  async callKimiAPI(messages, systemPrompt = '', options = {}) {
    try {
      if (!this.kimiApiKey) {
        throw new Error('Kimi API key not configured');
      }

      const requestData = {
        model: this.kimiModel,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          ...messages
        ],
        max_tokens: options.max_tokens || 131072,
        temperature: options.temperature || 0.7
      };

      const response = await axios.post(`${this.kimiBaseUrl}/chat/completions`, requestData, {
        headers: {
          'Authorization': `Bearer ${this.kimiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      } else {
        throw new Error('No response from Kimi API');
      }
    } catch (error) {
      logger.error('Kimi API error:', error.response?.data || error.message);
      throw new Error('AI service temporarily unavailable');
    }
  }

  /**
   * 统一的AI响应生成接口
   */
  async generateResponse(messages, systemPrompt = '', options = {}) {
    try {
      if (this.provider === 'alicloud') {
        return await this.callAlicloudAPI(messages, systemPrompt, options);
      } else if (this.provider === 'openai') {
        return await this.callOpenAIAPI(messages, systemPrompt, options);
      } else if (this.provider === 'kimi') {
        return await this.callKimiAPI(messages, systemPrompt, options);
      } else {
        throw new Error(`Unsupported AI provider: ${this.provider}`);
      }
    } catch (error) {
      logger.error('AI response generation error:', error);
      
      // 降级处理：如果主要服务失败，尝试备用服务
      if (this.provider === 'alicloud' && this.openaiApiKey) {
        logger.info('Falling back to OpenAI API');
        try {
          return await this.callOpenAIAPI(messages, systemPrompt, options);
        } catch (fallbackError) {
          logger.error('Fallback OpenAI API also failed:', fallbackError);
        }
      }
      
      // 返回默认响应
      return this.getDefaultResponse();
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
}

module.exports = new AIBase();
