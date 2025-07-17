const mongoose = require('mongoose');

const practiceSessionSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  taskTemplateId: {
    type: mongoose.Schema.ObjectId,
    ref: 'TaskTemplate',
    required: false
  },
  taskConfig: {
    type: mongoose.Schema.Types.Mixed,
    required: false
  },
  aiPrompt: {
    type: String,
    required: false
  },
  sessionName: {
    type: String,
    required: [true, 'Please add a session name'],
    trim: true,
    maxlength: [100, 'Session name cannot be more than 100 characters']
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'submitted', 'evaluated'],
    default: 'in_progress'
  },
  conversation: [{
    role: {
      type: String,
      enum: ['student', 'ai_customer'],
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [1000, 'Message cannot be more than 1000 characters']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  aiEvaluation: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    dimensionScores: [{
      dimension: {
        type: String,
        required: true,
        enum: ['沟通维度', '本品维度', '竞品维度', '客户信息获取维度', '方法论匹配度']
      },
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      feedback: {
        type: String,
        maxlength: [500, 'Feedback cannot be more than 500 characters']
      },
      // 添加详细标准评分
      details: [{
        id: {
          type: String,
          required: true
        },
        criteria: {
          type: String,
          required: true
        },
        score: {
          type: Number,
          required: true,
          min: 0,
          max: 100
        },
        feedback: {
          type: String,
          maxlength: [300, 'Detail feedback cannot be more than 300 characters']
        },
        evidence: {
          type: String,
          maxlength: [200, 'Evidence cannot be more than 200 characters']
        }
      }]
    }],
    suggestions: [{
      type: String,
      maxlength: [200, 'Suggestion cannot be more than 200 characters']
    }],
    strengths: [{
      type: String,
      maxlength: [200, 'Strength cannot be more than 200 characters']
    }],
    generatedAt: {
      type: Date
    }
  },
  mentorEvaluation: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100
    },
    feedback: {
      type: String,
      maxlength: [1000, 'Feedback cannot be more than 1000 characters']
    },
    evaluatedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    evaluatedAt: {
      type: Date
    },
    // 详细的14个细则评分
    detailedScores: {
      // 沟通维度 (4个细则)
      criteria1: { type: Number, min: 0, max: 100 }, // 匹配客户的沟通方式
      criteria2: { type: Number, min: 0, max: 100 }, // 识别客户的沟通方式
      criteria3: { type: Number, min: 0, max: 100 }, // 引导沟通的方向
      criteria4: { type: Number, min: 0, max: 100 }, // 清晰的表达自己的观点
      
      // 本品维度 (3个细则)
      criteria5: { type: Number, min: 0, max: 100 }, // 本品产品知识正确
      criteria6: { type: Number, min: 0, max: 100 }, // 突出本产品的配置或者功能优势
      criteria7: { type: Number, min: 0, max: 100 }, // 清晰的确定客户的目标车型
      
      // 竞品维度 (3个细则)
      criteria8: { type: Number, min: 0, max: 100 }, // 了解竞品的相关知识
      criteria9: { type: Number, min: 0, max: 100 }, // 可以找出本品和竞品间的差异
      criteria10: { type: Number, min: 0, max: 100 }, // 可以客观的进行竞品和本品的对比
      
      // 客户信息获取维度 (3个细则)
      criteria11: { type: Number, min: 0, max: 100 }, // 了解了客户的兴趣爱好
      criteria12: { type: Number, min: 0, max: 100 }, // 了解了客户的职业背景
      criteria13: { type: Number, min: 0, max: 100 }, // 可以匹配客户的性格特征，进行沟通
      
      // 方法论匹配度 (1个细则)
      criteria14: { type: Number, min: 0, max: 100 }  // 可以在场景中，清晰运用预设的方法论
    },
    // 各维度平均分
    dimensionAverages: {
      communication: { type: Number, min: 0, max: 100 },    // 沟通维度平均分
      ownProduct: { type: Number, min: 0, max: 100 },       // 本品维度平均分
      competitor: { type: Number, min: 0, max: 100 },       // 竞品维度平均分
      customerInfo: { type: Number, min: 0, max: 100 },     // 客户信息获取维度平均分
      methodology: { type: Number, min: 0, max: 100 }       // 方法论匹配度
    }
  },
  customerProfile: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  submittedAt: {
    type: Date
  },
  duration: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
practiceSessionSchema.index({ studentId: 1, status: 1 });
practiceSessionSchema.index({ taskTemplateId: 1 });
practiceSessionSchema.index({ createdAt: -1 });

// Virtual for conversation count
practiceSessionSchema.virtual('messageCount').get(function() {
  return this.conversation.length;
});

// Method to add message to conversation
practiceSessionSchema.methods.addMessage = function(role, message, metadata = {}) {
  this.conversation.push({
    role,
    message,
    metadata,
    timestamp: new Date()
  });
  return this.save();
};

// Method to calculate session duration
practiceSessionSchema.methods.calculateDuration = function() {
  if (this.completedAt && this.startedAt) {
    this.duration = Math.round((this.completedAt - this.startedAt) / (1000 * 60)); // in minutes
  }
  return this.duration;
};

module.exports = mongoose.model('PracticeSession', practiceSessionSchema);
