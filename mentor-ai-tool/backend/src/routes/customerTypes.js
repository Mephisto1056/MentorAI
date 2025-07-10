const express = require('express');
const router = express.Router();
const customerProfileService = require('../services/customerProfileService');
const logger = require('../utils/logger');

/**
 * 获取所有保时捷客户类型
 */
router.get('/', async (req, res) => {
  try {
    const customerTypes = customerProfileService.getAllCustomerTypes();
    res.json({
      success: true,
      data: customerTypes
    });
  } catch (error) {
    logger.error('Get customer types error:', error);
    res.status(500).json({
      success: false,
      error: '获取客户类型失败'
    });
  }
});

/**
 * 根据客户类型生成详细配置
 */
router.get('/:typeName/config', async (req, res) => {
  try {
    const { typeName } = req.params;
    const customizations = req.query;
    
    const config = customerProfileService.generateRandomConfigForType(typeName);
    if (!config) {
      return res.status(404).json({
        success: false,
        error: '未找到指定的客户类型'
      });
    }
    
    // 应用自定义参数
    const finalConfig = { ...config, ...customizations };
    
    res.json({
      success: true,
      data: finalConfig
    });
  } catch (error) {
    logger.error('Generate customer config error:', error);
    res.status(500).json({
      success: false,
      error: '生成客户配置失败'
    });
  }
});

/**
 * 生成客户类型专用提示词
 */
router.post('/:typeName/prompt', async (req, res) => {
  try {
    const { typeName } = req.params;
    const taskConfig = req.body;
    
    const prompt = customerProfileService.generateCustomerTypePrompt(typeName, taskConfig);
    
    res.json({
      success: true,
      data: {
        customerType: typeName,
        prompt: prompt,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    logger.error('Generate customer prompt error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '生成客户提示词失败'
    });
  }
});

/**
 * 智能推荐客户类型
 */
router.post('/recommend', async (req, res) => {
  try {
    const basicInfo = req.body;
    
    const recommendation = customerProfileService.recommendCustomerType(basicInfo);
    
    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    logger.error('Recommend customer type error:', error);
    res.status(500).json({
      success: false,
      error: '推荐客户类型失败'
    });
  }
});

/**
 * 验证客户配置合理性
 */
router.post('/validate', async (req, res) => {
  try {
    const config = req.body;
    
    const validation = customerProfileService.validateCustomerConfig(config);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.error('Validate customer config error:', error);
    res.status(500).json({
      success: false,
      error: '验证客户配置失败'
    });
  }
});

/**
 * 获取特定客户类型的详细信息
 */
router.get('/:typeName', async (req, res) => {
  try {
    const { typeName } = req.params;
    const customizations = req.query;
    
    const profile = customerProfileService.generateDetailedProfile(typeName, customizations);
    
    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    logger.error('Get customer type detail error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '获取客户类型详情失败'
    });
  }
});

module.exports = router;
