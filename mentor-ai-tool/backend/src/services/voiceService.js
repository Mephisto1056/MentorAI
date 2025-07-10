const axios = require('axios');
const logger = require('../utils/logger');

class VoiceService {
  constructor() {
    // 阿里云CosyVoice配置
    this.alicloudApiKey = process.env.ALICLOUD_API_KEY;
    this.cosyVoiceBaseUrl = process.env.COSYVOICE_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1/services/audio/tts';
    this.cosyVoiceModel = process.env.COSYVOICE_MODEL || 'cosyvoice-v1';
    
    // CosyVoice语音角色配置 - 基于人设的语音特征
    this.cosyVoiceProfiles = {
      // 女性角色
      female: {
        young: {
          voice: 'longxiaochun',  // 年轻女性，活泼清新
          description: '年轻女性，声音清脆活泼'
        },
        middle: {
          voice: 'longyaoyao',    // 中年女性，温和知性
          description: '中年女性，声音温和知性'
        },
        mature: {
          voice: 'longwan',       // 成熟女性，稳重优雅
          description: '成熟女性，声音稳重优雅'
        }
      },
      // 男性角色
      male: {
        young: {
          voice: 'longfei',       // 年轻男性，阳光活力
          description: '年轻男性，声音阳光有活力'
        },
        middle: {
          voice: 'longhua',       // 中年男性，沉稳专业
          description: '中年男性，声音沉稳专业'
        },
        mature: {
          voice: 'longxiaobei',   // 成熟男性，深沉权威
          description: '成熟男性，声音深沉有权威感'
        }
      }
    };
    
    // 性格对应的语音风格调节
    this.personalityVoiceStyles = {
      '理性': {
        speed: 0.9,           // 稍慢，体现思考
        emotion: 'neutral',   // 中性情感
        description: '理性客观，语速稍慢，语调平稳'
      },
      '感性': {
        speed: 1.0,
        emotion: 'warm',      // 温暖情感
        description: '感性温和，语调有起伏，富有感情'
      },
      '外向': {
        speed: 1.1,           // 稍快，体现活跃
        emotion: 'cheerful',  // 开朗情感
        description: '外向活泼，语速较快，语调明快'
      },
      '内向': {
        speed: 0.8,           // 较慢，体现内敛
        emotion: 'calm',      // 平静情感
        description: '内向沉稳，语速较慢，语调低沉'
      },
      '急躁': {
        speed: 1.2,           // 快速，体现急切
        emotion: 'urgent',    // 急切情感
        description: '急躁不耐，语速较快，语调急促'
      },
      '耐心': {
        speed: 0.85,          // 慢速，体现耐心
        emotion: 'patient',   // 耐心情感
        description: '耐心细致，语速缓慢，语调温和'
      },
      '犹豫': {
        speed: 0.9,
        emotion: 'hesitant',  // 犹豫情感
        description: '犹豫不决，语速不均，有停顿'
      }
    };
    
    this.validateConfig();
  }

  validateConfig() {
    if (!this.alicloudApiKey) {
      logger.warn('Alicloud API key not configured for voice service');
    }
    if (!this.ttsAppKey) {
      logger.warn('Alicloud TTS App Key not configured');
    }
  }

  /**
   * 根据客户画像选择合适的CosyVoice配置
   */
  selectCosyVoiceProfile(customerProfile) {
    try {
      const gender = customerProfile.gender === '男' ? 'male' : 'female';
      const age = this.parseAge(customerProfile.age);
      const personality = customerProfile.personality || [];
      
      // 根据年龄选择基础语音角色
      let ageGroup = 'middle';
      if (age < 30) ageGroup = 'young';
      else if (age > 50) ageGroup = 'mature';
      
      const baseVoice = this.cosyVoiceProfiles[gender][ageGroup];
      
      // 根据性格选择语音风格
      let voiceStyle = this.personalityVoiceStyles['理性']; // 默认理性
      
      if (personality.length > 0) {
        const mainPersonality = personality[0];
        if (this.personalityVoiceStyles[mainPersonality]) {
          voiceStyle = this.personalityVoiceStyles[mainPersonality];
        }
      }
      
      return {
        voice: baseVoice.voice,
        voiceDescription: baseVoice.description,
        speed: voiceStyle.speed,
        emotion: voiceStyle.emotion,
        styleDescription: voiceStyle.description,
        customerProfile: {
          gender: gender,
          age: age,
          ageGroup: ageGroup,
          personality: personality[0] || '理性'
        }
      };
    } catch (error) {
      logger.error('CosyVoice profile selection error:', error);
      // 返回默认配置
      return {
        voice: 'longyaoyao',
        voiceDescription: '中年女性，声音温和知性',
        speed: 1.0,
        emotion: 'neutral',
        styleDescription: '理性客观，语调平稳',
        customerProfile: {
          gender: 'female',
          age: 35,
          ageGroup: 'middle',
          personality: '理性'
        }
      };
    }
  }

  /**
   * 解析年龄字符串
   */
  parseAge(ageString) {
    if (!ageString) return 35;
    
    const match = ageString.match(/(\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
    
    // 处理年龄段
    if (ageString.includes('20')) return 25;
    if (ageString.includes('30')) return 35;
    if (ageString.includes('40')) return 45;
    if (ageString.includes('50')) return 55;
    
    return 35; // 默认年龄
  }

  /**
   * 使用CosyVoice进行文字转语音
   */
  async cosyVoiceTextToSpeech(text, voiceProfile) {
    try {
      if (!this.alicloudApiKey) {
        throw new Error('CosyVoice service not configured');
      }

      // 构建CosyVoice请求参数
      const requestData = {
        model: this.cosyVoiceModel,
        input: {
          text: text
        },
        parameters: {
          voice: voiceProfile.voice,
          rate: voiceProfile.speed,
          format: 'mp3',
          sample_rate: 22050
        }
      };

      logger.info(`CosyVoice TTS request: ${voiceProfile.voice} (${voiceProfile.voiceDescription}), speed: ${voiceProfile.speed}, emotion: ${voiceProfile.emotion}`);

      const response = await axios.post(
        this.cosyVoiceBaseUrl,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${this.alicloudApiKey}`,
            'Content-Type': 'application/json',
            'X-DashScope-Async': 'enable'
          },
          timeout: 30000
        }
      );

      if (response.status === 200 && response.data.output) {
        // CosyVoice返回音频URL或Base64数据
        let audioData = null;
        
        if (response.data.output.audio_url) {
          // 如果返回的是URL，需要下载音频数据
          const audioResponse = await axios.get(response.data.output.audio_url, {
            responseType: 'arraybuffer',
            timeout: 30000
          });
          audioData = Buffer.from(audioResponse.data).toString('base64');
        } else if (response.data.output.audio) {
          // 如果直接返回Base64数据
          audioData = response.data.output.audio;
        }

        if (audioData) {
          return {
            success: true,
            audioData: audioData,
            format: 'mp3',
            voiceProfile: voiceProfile,
            source: 'CosyVoice'
          };
        } else {
          throw new Error('No audio data received from CosyVoice');
        }
      } else {
        throw new Error(`CosyVoice API returned status: ${response.status}`);
      }
    } catch (error) {
      logger.error('CosyVoice TTS error:', error.response?.data || error.message);
      
      // 降级处理：返回文字信息，前端使用Web Speech API
      return {
        success: false,
        fallback: true,
        text: text,
        voiceProfile: voiceProfile,
        error: 'CosyVoice service unavailable, using browser TTS',
        source: 'fallback'
      };
    }
  }

  /**
   * 文字转语音 - 兼容旧接口
   */
  async textToSpeech(text, voiceConfig = {}) {
    // 如果传入的是新的voiceProfile格式，直接使用CosyVoice
    if (voiceConfig.voice && voiceConfig.voiceDescription) {
      return await this.cosyVoiceTextToSpeech(text, voiceConfig);
    }
    
    // 否则降级到浏览器TTS
    return {
      success: false,
      fallback: true,
      text: text,
      config: voiceConfig,
      error: 'Using browser TTS for compatibility',
      source: 'browser'
    };
  }

  /**
   * 语音识别 - 阿里云ASR（备用方案）
   */
  async speechToText(audioData, format = 'wav') {
    try {
      if (!this.alicloudApiKey) {
        throw new Error('ASR service not configured');
      }

      // 构建ASR请求
      const asrParams = {
        appkey: process.env.ALICLOUD_ASR_APP_KEY,
        format: format,
        sample_rate: 16000,
        enable_punctuation_prediction: true,
        enable_inverse_text_normalization: true
      };

      const response = await axios.post(
        `${this.alicloudBaseUrl}/stream/v1/asr`,
        {
          ...asrParams,
          audio: audioData
        },
        {
          headers: {
            'Authorization': `Bearer ${this.alicloudApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data && response.data.result) {
        return {
          success: true,
          text: response.data.result,
          confidence: response.data.confidence || 0.8
        };
      } else {
        throw new Error('No recognition result');
      }
    } catch (error) {
      logger.error('ASR error:', error.response?.data || error.message);
      return {
        success: false,
        error: 'Speech recognition service unavailable'
      };
    }
  }

  /**
   * 生成客户语音响应 - 使用CosyVoice
   */
  async generateCustomerVoiceResponse(text, customerProfile) {
    try {
      // 选择合适的CosyVoice配置
      const voiceProfile = this.selectCosyVoiceProfile(customerProfile);
      
      logger.info(`Generating voice for customer: ${customerProfile.name || 'Unknown'}, Profile: ${voiceProfile.voiceDescription}, Style: ${voiceProfile.styleDescription}`);
      
      // 使用CosyVoice生成语音
      const ttsResult = await this.cosyVoiceTextToSpeech(text, voiceProfile);
      
      return {
        text: text,
        voice: ttsResult,
        profile: customerProfile,
        voiceProfile: voiceProfile
      };
    } catch (error) {
      logger.error('Customer voice response generation error:', error);
      return {
        text: text,
        voice: {
          success: false,
          fallback: true,
          error: 'Voice generation failed',
          source: 'error'
        },
        profile: customerProfile,
        voiceProfile: null
      };
    }
  }

  /**
   * 获取可用的语音列表
   */
  getAvailableVoices() {
    const voices = [];
    
    Object.keys(this.voiceProfiles).forEach(gender => {
      Object.keys(this.voiceProfiles[gender]).forEach(age => {
        const voice = this.voiceProfiles[gender][age];
        voices.push({
          id: voice.voice,
          name: `${gender === 'male' ? '男性' : '女性'} - ${age === 'young' ? '年轻' : age === 'middle' ? '中年' : '成熟'}`,
          gender: gender,
          age: age,
          voice: voice.voice
        });
      });
    });
    
    return voices;
  }

  /**
   * 验证语音配置
   */
  validateVoiceConfig(config) {
    const errors = [];
    
    if (config.speed < -500 || config.speed > 500) {
      errors.push('Speed must be between -500 and 500');
    }
    
    if (config.pitch < -500 || config.pitch > 500) {
      errors.push('Pitch must be between -500 and 500');
    }
    
    if (config.volume < 0 || config.volume > 100) {
      errors.push('Volume must be between 0 and 100');
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = new VoiceService();
