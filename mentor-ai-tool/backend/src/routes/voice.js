const express = require('express');
const router = express.Router();
const voiceService = require('../services/voiceService');
const logger = require('../utils/logger');

// 文字转语音
router.post('/synthesize', async (req, res) => {
  try {
    const { text, customerProfile, voiceConfig } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    let finalVoiceConfig = voiceConfig;
    
    // 如果提供了客户画像，自动选择语音配置
    if (customerProfile && !voiceConfig) {
      finalVoiceConfig = voiceService.selectVoiceProfile(customerProfile);
    }

    const result = await voiceService.textToSpeech(text, finalVoiceConfig);

    res.json({
      success: true,
      data: result
    });

    logger.info(`TTS request processed for text: ${text.substring(0, 50)}...`);
  } catch (error) {
    logger.error('TTS API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to synthesize speech',
      error: error.message
    });
  }
});

// 语音识别
router.post('/recognize', async (req, res) => {
  try {
    const { audioData, format } = req.body;

    if (!audioData) {
      return res.status(400).json({
        success: false,
        message: 'Audio data is required'
      });
    }

    const result = await voiceService.speechToText(audioData, format);

    res.json({
      success: result.success,
      data: result
    });

    if (result.success) {
      logger.info(`ASR request processed, recognized: ${result.text.substring(0, 50)}...`);
    } else {
      logger.warn('ASR request failed:', result.error);
    }
  } catch (error) {
    logger.error('ASR API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recognize speech',
      error: error.message
    });
  }
});

// 生成客户语音响应（集成AI+TTS）
router.post('/customer-response', async (req, res) => {
  try {
    const { text, customerProfile } = req.body;

    if (!text || !customerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Text and customer profile are required'
      });
    }

    const result = await voiceService.generateCustomerVoiceResponse(text, customerProfile);

    res.json({
      success: true,
      data: result
    });

    logger.info(`Customer voice response generated for: ${customerProfile.name || 'Unknown'}`);
  } catch (error) {
    logger.error('Customer voice response API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate customer voice response',
      error: error.message
    });
  }
});

// 获取可用语音列表
router.get('/voices', async (req, res) => {
  try {
    const voices = voiceService.getAvailableVoices();

    res.json({
      success: true,
      data: voices
    });

    logger.info('Available voices list requested');
  } catch (error) {
    logger.error('Get voices API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available voices',
      error: error.message
    });
  }
});

// 根据客户画像推荐语音配置
router.post('/recommend-voice', async (req, res) => {
  try {
    const { customerProfile } = req.body;

    if (!customerProfile) {
      return res.status(400).json({
        success: false,
        message: 'Customer profile is required'
      });
    }

    const voiceConfig = voiceService.selectVoiceProfile(customerProfile);

    res.json({
      success: true,
      data: {
        voiceConfig,
        customerProfile,
        recommendation: {
          reason: `基于客户性别(${customerProfile.gender})、年龄(${customerProfile.age})和性格特征推荐`,
          confidence: 0.8
        }
      }
    });

    logger.info(`Voice recommendation generated for customer: ${customerProfile.name || 'Unknown'}`);
  } catch (error) {
    logger.error('Voice recommendation API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recommend voice configuration',
      error: error.message
    });
  }
});

// 验证语音配置
router.post('/validate-config', async (req, res) => {
  try {
    const { voiceConfig } = req.body;

    if (!voiceConfig) {
      return res.status(400).json({
        success: false,
        message: 'Voice configuration is required'
      });
    }

    const validation = voiceService.validateVoiceConfig(voiceConfig);

    res.json({
      success: true,
      data: validation
    });

    logger.info('Voice configuration validation requested');
  } catch (error) {
    logger.error('Voice config validation API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate voice configuration',
      error: error.message
    });
  }
});

// 语音设置管理
router.get('/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // 这里可以从数据库获取用户的语音设置
    // 暂时返回默认设置
    const defaultSettings = {
      enableVoice: true,
      autoPlay: true,
      volume: 0.8,
      speed: 1.0,
      preferredVoice: 'zhixiaoxia'
    };

    res.json({
      success: true,
      data: defaultSettings
    });

    logger.info(`Voice settings requested for user: ${userId}`);
  } catch (error) {
    logger.error('Get voice settings API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get voice settings',
      error: error.message
    });
  }
});

router.post('/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = req.body;

    // 这里可以保存用户的语音设置到数据库
    // 暂时只返回成功响应
    
    res.json({
      success: true,
      data: settings,
      message: 'Voice settings saved successfully'
    });

    logger.info(`Voice settings saved for user: ${userId}`);
  } catch (error) {
    logger.error('Save voice settings API error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save voice settings',
      error: error.message
    });
  }
});

module.exports = router;
