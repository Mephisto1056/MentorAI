const express = require('express');
const PracticeSession = require('../models/PracticeSession');
const TaskTemplate = require('../models/TaskTemplate');
const User = require('../models/User');
const { authorize } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
router.get('/dashboard', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let dashboardData = {};

    if (userRole === 'student') {
      // Student dashboard
      const totalSessions = await PracticeSession.countDocuments({ studentId: userId });
      const completedSessions = await PracticeSession.countDocuments({ 
        studentId: userId, 
        status: { $in: ['completed', 'submitted', 'evaluated'] }
      });
      const averageScore = await PracticeSession.aggregate([
        { $match: { studentId: userId, 'aiEvaluation.overallScore': { $exists: true } } },
        { $group: { _id: null, avgScore: { $avg: '$aiEvaluation.overallScore' } } }
      ]);

      dashboardData = {
        totalSessions,
        completedSessions,
        completionRate: totalSessions > 0 ? (completedSessions / totalSessions * 100).toFixed(1) : 0,
        averageScore: averageScore.length > 0 ? averageScore[0].avgScore.toFixed(1) : 0
      };
    } else {
      // Mentor/Admin dashboard
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalSessions = await PracticeSession.countDocuments();
      const pendingEvaluations = await PracticeSession.countDocuments({ 
        status: 'submitted',
        'mentorEvaluation.evaluatedAt': { $exists: false }
      });

      dashboardData = {
        totalStudents,
        totalSessions,
        pendingEvaluations,
        activeTemplates: await TaskTemplate.countDocuments({ isActive: true })
      };
    }

    res.status(200).json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.error('Get dashboard analytics error:', error);
    next(error);
  }
});

// @desc    Get completion rate analytics
// @route   GET /api/analytics/completion
// @access  Private (Mentor/Admin only)
router.get('/completion', authorize('mentor', 'admin'), async (req, res, next) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
        break;
    }

    const completionStats = await PracticeSession.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: completionStats
    });
  } catch (error) {
    logger.error('Get completion analytics error:', error);
    next(error);
  }
});

// @desc    Get performance analytics
// @route   GET /api/analytics/performance
// @access  Private (Mentor/Admin only)
router.get('/performance', authorize('mentor', 'admin'), async (req, res, next) => {
  try {
    const performanceData = await PracticeSession.aggregate([
      {
        $match: {
          'aiEvaluation.overallScore': { $exists: true }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      {
        $unwind: '$student'
      },
      {
        $group: {
          _id: '$studentId',
          studentName: { $first: '$student.profile.name' },
          averageScore: { $avg: '$aiEvaluation.overallScore' },
          sessionCount: { $sum: 1 }
        }
      },
      {
        $sort: { averageScore: -1 }
      },
      {
        $limit: 20
      }
    ]);

    res.status(200).json({
      success: true,
      data: performanceData
    });
  } catch (error) {
    logger.error('Get performance analytics error:', error);
    next(error);
  }
});

// @desc    Get trend analytics
// @route   GET /api/analytics/trends
// @access  Private (Mentor/Admin only)
router.get('/trends', authorize('mentor', 'admin'), async (req, res, next) => {
  try {
    const { period = 'daily' } = req.query;
    
    let groupBy = {};
    switch (period) {
      case 'daily':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'weekly':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'monthly':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
    }

    const trendData = await PracticeSession.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: groupBy,
          sessionCount: { $sum: 1 },
          completedCount: {
            $sum: {
              $cond: [
                { $in: ['$status', ['completed', 'submitted', 'evaluated']] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: trendData
    });
  } catch (error) {
    logger.error('Get trend analytics error:', error);
    next(error);
  }
});

module.exports = router;
