const mongoose = require('mongoose');

const taskTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a task template name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  configuration: {
    taskGoal: {
      type: String,
      required: [true, 'Please specify task goal'],
      enum: ['小米SU7竞品对比', '991-2产品介绍', '客户需求挖掘', '金融方案销售', '试驾邀约']
    },
    methodology: {
      type: String,
      required: [true, 'Please specify methodology'],
      enum: ['FAB产品介绍技巧', 'RACE竞品对比介绍', 'SPIN销售法', '顾问式销售']
    },
    customerDimensions: {
      personality: [{
        type: String,
        enum: ['独立', '犹豫', '理性', '强势', '相信朋友', '数据导向', '主导权', '隐藏需求', '喜欢案例', '积极表达', '易信网络', '服从权威']
      }],
      profession: {
        type: String,
        enum: ['金融分析', '网络直播', '冲压工厂', '电子配件生产', '医生', '律师', '教师', '工程师']
      },
      communicationStyle: {
        type: String,
        enum: ['D控制型', 'I影响型', 'C遵循型', 'S稳定型']
      },
      hobbies: [{
        type: String,
        enum: ['高尔夫', '旅游', '乒乓球', '网球', '摄影', '音乐', '阅读', '健身']
      }],
      gender: {
        type: String,
        enum: ['男', '女']
      },
      ageRange: {
        type: String,
        enum: ['20-30', '30-40', '40-50', '50-60', '60+']
      }
    },
    productDimensions: {
      currentVehicle: {
        type: String,
        enum: ['无', 'G2-1', 'E2-1', '991-2', 'G3-1', 'Taycan', 'Macan', 'Cayenne']
      },
      interestedVehicle: {
        type: String,
        enum: ['G3-1', '982-Boxster', 'E3-1', 'Taycan J2', '911 Turbo', 'Panamera', 'Macan S']
      },
      focusPoints: [{
        type: String,
        enum: ['外观', '动力', '内饰', '智能化', '充电', '残值', '品牌', '服务']
      }]
    },
    competitorDimensions: {
      currentVehicle: {
        type: String,
        enum: ['BMW X5', 'AUDI A7', 'Benz S480', 'Volvo S80', 'Tesla Model S', '理想L9']
      },
      interestedVehicle: {
        type: String,
        enum: ['SU 7', '理想L9', 'Benz GLS', 'BMW iX', 'Tesla Model X']
      },
      focusPoints: [{
        type: String,
        enum: ['外观', '动力', '内饰', '智能化', '充电', '残值', '价格', '服务']
      }]
    },
    transactionDimensions: {
      negotiationStage: {
        type: String,
        enum: ['产品介绍', '试乘试驾', '交易洽谈', '签约成交']
      },
      concerns: [{
        type: String,
        enum: ['价格优惠', '赠送附件', '按揭优惠', '服务体验', '价格对比', '交付时间']
      }]
    }
  },
  evaluationCriteria: [{
    dimension: {
      type: String,
      required: true,
      enum: ['沟通维度', '本品维度', '竞品维度', '客户信息获取维度', '方法论匹配度']
    },
    criteria: [{
      type: String,
      required: true
    }]
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
taskTemplateSchema.index({ createdBy: 1, isActive: 1 });
taskTemplateSchema.index({ 'configuration.taskGoal': 1 });

module.exports = mongoose.model('TaskTemplate', taskTemplateSchema);
