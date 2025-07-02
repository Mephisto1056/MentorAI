const express = require('express');
const PracticeSession = require('../models/PracticeSession');
const { authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// 简单的模拟认证中间件
const mockAuth = (req, res, next) => {
  // 为演示目的，创建一个模拟用户
  req.user = {
    id: '507f1f77bcf86cd799439011',
    role: 'mentor', // 导师角色用于评估
    username: 'demo-mentor',
    profile: { name: '演示导师' }
  };
  next();
};

// 应用模拟认证中间件到所有路由
router.use(mockAuth);

// @desc    Get pending evaluations for mentors
// @route   GET /api/evaluations/pending
// @access  Private (Mentor/Admin only)
router.get('/pending', async (req, res, next) => {
  try {
    const sessions = await PracticeSession.find({ 
      status: 'submitted',
      'mentorEvaluation.evaluatedAt': { $exists: false }
    })
    .populate('studentId', 'username profile.name')
    .populate('taskTemplateId', 'name description')
    .sort({ submittedAt: 1 });

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    logger.error('Get pending evaluations error:', error);
    next(error);
  }
});

// @desc    Submit mentor evaluation
// @route   POST /api/evaluations/:sessionId
// @access  Private (Mentor/Admin only)
router.post('/:sessionId', async (req, res, next) => {
  try {
    const { overallScore, feedback } = req.body;
    
    const session = await PracticeSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Practice session not found'
      });
    }

    if (session.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        error: 'Session must be submitted before evaluation'
      });
    }

    session.mentorEvaluation = {
      overallScore,
      feedback,
      evaluatedBy: req.user.id,
      evaluatedAt: new Date()
    };

    session.status = 'evaluated';
    await session.save();

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    logger.error('Submit evaluation error:', error);
    next(error);
  }
});

// @desc    Get evaluation history
// @route   GET /api/evaluations/history
// @access  Private
router.get('/history', async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    let query = { status: 'evaluated' };
    
    // If user is student, only show their evaluations
    if (req.user.role === 'student') {
      query.studentId = req.user.id;
    }

    const sessions = await PracticeSession.find(query)
      .populate('studentId', 'username profile.name')
      .populate('taskTemplateId', 'name description')
      .populate('mentorEvaluation.evaluatedBy', 'username profile.name')
      .sort({ 'mentorEvaluation.evaluatedAt': -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await PracticeSession.countDocuments(query);

    res.status(200).json({
      success: true,
      count: sessions.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: sessions
    });
  } catch (error) {
    logger.error('Get evaluation history error:', error);
    next(error);
  }
});

module.exports = router;
