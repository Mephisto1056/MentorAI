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
      }
    }],
    suggestions: [{
      type: String,
      maxlength: [200, 'Suggestion cannot be more than 200 characters']
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
