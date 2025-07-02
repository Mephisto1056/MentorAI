const express = require('express');
const TaskTemplate = require('../models/TaskTemplate');
const { authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get all task templates
// @route   GET /api/tasks/templates
// @access  Private
router.get('/templates', async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const templates = await TaskTemplate.find(query)
      .populate('createdBy', 'username profile.name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TaskTemplate.countDocuments(query);

    res.status(200).json({
      success: true,
      count: templates.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      },
      data: templates
    });
  } catch (error) {
    logger.error('Get templates error:', error);
    next(error);
  }
});

// @desc    Create new task template
// @route   POST /api/tasks/templates
// @access  Private (Mentor/Admin only)
router.post('/templates', authorize('mentor', 'admin'), async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;
    
    const template = await TaskTemplate.create(req.body);
    
    res.status(201).json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error('Create template error:', error);
    next(error);
  }
});

// @desc    Get single task template
// @route   GET /api/tasks/templates/:id
// @access  Private
router.get('/templates/:id', async (req, res, next) => {
  try {
    const template = await TaskTemplate.findById(req.params.id)
      .populate('createdBy', 'username profile.name');

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Task template not found'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error('Get template error:', error);
    next(error);
  }
});

// @desc    Update task template
// @route   PUT /api/tasks/templates/:id
// @access  Private (Mentor/Admin only)
router.put('/templates/:id', authorize('mentor', 'admin'), async (req, res, next) => {
  try {
    const template = await TaskTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Task template not found'
      });
    }

    res.status(200).json({
      success: true,
      data: template
    });
  } catch (error) {
    logger.error('Update template error:', error);
    next(error);
  }
});

// @desc    Delete task template
// @route   DELETE /api/tasks/templates/:id
// @access  Private (Admin only)
router.delete('/templates/:id', authorize('admin'), async (req, res, next) => {
  try {
    const template = await TaskTemplate.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Task template not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task template deleted successfully'
    });
  } catch (error) {
    logger.error('Delete template error:', error);
    next(error);
  }
});

// @desc    Get task dimensions configuration
// @route   GET /api/tasks/dimensions
// @access  Private
router.get('/dimensions', (req, res) => {
  const dimensions = {
    taskGoals: ['小米SU7竞品对比', '991-2产品介绍', '客户需求挖掘', '金融方案销售', '试驾邀约'],
    methodologies: ['FAB产品介绍技巧', 'RACE竞品对比介绍', 'SPIN销售法', '顾问式销售'],
    customerDimensions: {
      personality: ['独立', '犹豫', '理性', '强势', '相信朋友', '数据导向', '主导权', '隐藏需求', '喜欢案例', '积极表达', '易信网络', '服从权威'],
      profession: ['金融分析', '网络直播', '冲压工厂', '电子配件生产', '医生', '律师', '教师', '工程师'],
      communicationStyle: ['D控制型', 'I影响型', 'C遵循型', 'S稳定型'],
      hobbies: ['高尔夫', '旅游', '乒乓球', '网球', '摄影', '音乐', '阅读', '健身'],
      gender: ['男', '女'],
      ageRange: ['20-30', '30-40', '40-50', '50-60', '60+']
    },
    productDimensions: {
      currentVehicle: ['无', 'G2-1', 'E2-1', '991-2', 'G3-1', 'Taycan', 'Macan', 'Cayenne'],
      interestedVehicle: ['G3-1', '982-Boxster', 'E3-1', 'Taycan J2', '911 Turbo', 'Panamera', 'Macan S'],
      focusPoints: ['外观', '动力', '内饰', '智能化', '充电', '残值', '品牌', '服务']
    },
    competitorDimensions: {
      currentVehicle: ['BMW X5', 'AUDI A7', 'Benz S480', 'Volvo S80', 'Tesla Model S', '理想L9'],
      interestedVehicle: ['SU 7', '理想L9', 'Benz GLS', 'BMW iX', 'Tesla Model X'],
      focusPoints: ['外观', '动力', '内饰', '智能化', '充电', '残值', '价格', '服务']
    },
    transactionDimensions: {
      negotiationStage: ['产品介绍', '试乘试驾', '交易洽谈', '签约成交'],
      concerns: ['价格优惠', '赠送附件', '按揭优惠', '服务体验', '价格对比', '交付时间']
    },
    evaluationDimensions: ['沟通维度', '本品维度', '竞品维度', '客户信息获取维度', '方法论匹配度']
  };

  res.status(200).json({
    success: true,
    data: dimensions
  });
});

module.exports = router;
