const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

// 生成AI响应的端点（用于降级模式）
router.post('/generate-response', async (req, res) => {
  try {
    const { message, taskConfig, aiPrompt, conversationHistory } = req.body;

    if (!message || !taskConfig) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message and taskConfig are required' 
      });
    }

    // 构建对话历史
    const conversation = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'student' : 'ai_customer',
      message: msg.content
    }));

    // 添加当前用户消息
    conversation.push({
      role: 'student',
      message: message
    });

    // 生成客户配置
    const customerProfile = {
      name: getCustomerName(taskConfig),
      profession: taskConfig.customerProfession,
      personality: taskConfig.customerPersonality,
      communicationStyle: taskConfig.customerCommunication,
      interests: taskConfig.customerHobbies,
      gender: taskConfig.customerGender,
      age: taskConfig.customerAge
    };

    // 生成AI响应 - 如果有aiPrompt就直接使用，否则用taskConfig生成
    const aiResponse = await aiService.generateCustomerResponse(
      conversation,
      customerProfile,
      taskConfig,
      aiPrompt // 传递前端生成的prompt
    );

    res.json({
      success: true,
      response: aiResponse
    });

    logger.info(`AI response generated for message: ${message.substring(0, 50)}...`);
  } catch (error) {
    logger.error('AI response generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI response',
      error: error.message
    });
  }
});

// 辅助函数：生成客户姓名
function getCustomerName(config) {
  const maleNames = ['李先生', '王先生', '张先生', '刘先生', '陈先生'];
  const femaleNames = ['李女士', '王女士', '张女士', '刘女士', '陈女士'];
  
  if (config.customerGender === '男') {
    return maleNames[Math.floor(Math.random() * maleNames.length)];
  } else if (config.customerGender === '女') {
    return femaleNames[Math.floor(Math.random() * femaleNames.length)];
  } else {
    const allNames = [...maleNames, ...femaleNames];
    return allNames[Math.floor(Math.random() * allNames.length)];
  }
}

// 生成语音响应的端点（文字+语音）
router.post('/generate-voice-response', async (req, res) => {
  try {
    const { message, taskConfig, aiPrompt, conversationHistory, enableVoice = true } = req.body;

    if (!message || !taskConfig) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message and taskConfig are required' 
      });
    }

    // 构建对话历史
    const conversation = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'student' : 'ai_customer',
      message: msg.content
    }));

    // 添加当前用户消息
    conversation.push({
      role: 'student',
      message: message
    });

    // 生成客户配置
    const customerProfile = {
      name: getCustomerName(taskConfig),
      profession: taskConfig.customerProfession,
      personality: taskConfig.customerPersonality,
      communicationStyle: taskConfig.customerCommunication,
      interests: taskConfig.customerHobbies,
      gender: taskConfig.customerGender,
      age: taskConfig.customerAge
    };

    // 生成AI语音响应 - 如果有aiPrompt就直接使用，否则用taskConfig生成
    const voiceResponse = await aiService.generateCustomerVoiceResponse(
      conversation,
      customerProfile,
      taskConfig,
      enableVoice,
      aiPrompt // 传递前端生成的prompt
    );

    res.json({
      success: true,
      data: voiceResponse
    });

    logger.info(`AI voice response generated for message: ${message.substring(0, 50)}...`);
  } catch (error) {
    logger.error('AI voice response generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI voice response',
      error: error.message
    });
  }
});

// 生成智能优化的prompt
router.post('/generate-prompt', async (req, res) => {
  try {
    const taskConfig = req.body;

    if (!taskConfig) {
      return res.status(400).json({ 
        success: false, 
        message: 'Task configuration is required' 
      });
    }

    // 调用AI服务生成智能优化的prompt
    const optimizedPrompt = await aiService.generateOptimizedPrompt(taskConfig);

    res.json({
      success: true,
      prompt: optimizedPrompt.prompt,
      customerType: optimizedPrompt.customerType
    });

    logger.info('Optimized prompt generated successfully');
  } catch (error) {
    logger.error('Prompt generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate optimized prompt',
      error: error.message
    });
  }
});

module.exports = router;
