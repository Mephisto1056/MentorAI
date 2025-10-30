
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getApiUrl } from '../../config';

interface CustomerType {
  name: string;
  description: string;
  characteristics: any;
}

export default function TaskGenerator(): React.JSX.Element {
  const [taskConfig, setTaskConfig] = useState({
    taskGoal: '',
    methodology: '',
    trainingFocus: [] as string[], // 新增：训练重点
    customerType: '', // 新增：客户类型
    customerPersonality: [] as string[],
    customerProfession: '',
    customerCommunication: '',
    customerHobbies: [] as string[],
    customerGender: '',
    customerAge: '',
    currentVehicle: '',
    interestedVehicle: '',
    customerFocus: [] as string[],
    competitorCurrent: '',
    competitorInterested: '',
    competitorFocus: [] as string[],
    negotiationStage: '',
    transactionConcerns: [] as string[]
  });

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [conflictWarnings, setConflictWarnings] = useState<string[]>([]);
  const [showCustomerTemplates, setShowCustomerTemplates] = useState(false);
  const [showRandomOptions, setShowRandomOptions] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const [customerTypes] = useState([
    {
      name: '成功企业家',
      description: '注重品牌象征意义，决策快速果断，偏好个性化定制',
      template: {
        customerPersonality: ['强势', '主导权', '独立'],
        customerProfession: '企业家',
        customerCommunication: 'D控制型',
        customerHobbies: ['高尔夫', '商务社交'],
        customerGender: '男',
        customerAge: '35-55',
        customerFocus: ['品牌象征意义', '个性化定制', '高端配置']
      }
    },
    {
      name: '精英专业人士',
      description: '理性分析价值与性能比，详细研究技术参数，重视专业评测意见',
      template: {
        customerPersonality: ['理性', '数据导向', '专业'],
        customerProfession: '医生',
        customerCommunication: 'C遵循型',
        customerHobbies: ['阅读', '研究'],
        customerGender: '男',
        customerAge: '30-50',
        customerFocus: ['技术参数', '性能数据', '价值分析']
      }
    },
    {
      name: '老牌豪车收藏家',
      description: '重视品牌历史传承，熟悉每款车型的发展历程，追求稀有限量版',
      template: {
        customerPersonality: ['传统', '品味', '历史情怀'],
        customerProfession: '收藏家',
        customerCommunication: 'S稳定型',
        customerHobbies: ['收藏', '历史研究'],
        customerGender: '男',
        customerAge: '45-65',
        customerFocus: ['品牌历史', '车型传承', '限量版']
      }
    },
    {
      name: '科技爱好者',
      description: '关注最新技术创新，热衷于保时捷混合动力和纯电动车型',
      template: {
        customerPersonality: ['创新', '前瞻', '技术控'],
        customerProfession: '工程师',
        customerCommunication: 'I影响型',
        customerHobbies: ['科技产品', '创新体验'],
        customerGender: '男',
        customerAge: '28-45',
        customerFocus: ['最新技术', '电动化', '智能功能']
      }
    },
    {
      name: '赛道爱好者',
      description: '极度重视驾驶体验和操控性能，决策基于赛道测试成绩',
      template: {
        customerPersonality: ['激情', '专业', '追求极致'],
        customerProfession: '赛车手',
        customerCommunication: 'D控制型',
        customerHobbies: ['赛车', '驾驶培训'],
        customerGender: '男',
        customerAge: '25-50',
        customerFocus: ['马力数据', '加速性能', '操控性']
      }
    },
    {
      name: '生活方式追求者',
      description: '视保时捷为生活品质象征，决策受社交圈影响，重视品牌带来的身份认同',
      template: {
        customerPersonality: ['时尚', '社交', '品质追求'],
        customerProfession: '媒体人士',
        customerCommunication: 'I影响型',
        customerHobbies: ['时尚', '社交', '旅行'],
        customerGender: '女',
        customerAge: '30-45',
        customerFocus: ['生活品质', '社交价值', '品牌形象']
      }
    },
    {
      name: '新兴富豪',
      description: '决策直接快速，看重即时满足感，品牌象征意义大于实用性',
      template: {
        customerPersonality: ['直接', '快速', '即时满足'],
        customerProfession: '新兴企业家',
        customerCommunication: 'D控制型',
        customerHobbies: ['社交媒体', '奢侈品'],
        customerGender: '男',
        customerAge: '25-40',
        customerFocus: ['品牌象征', '最新款式', '显眼外观']
      }
    },
    {
      name: '家庭升级型',
      description: '将保时捷视为家庭用车升级选择，关注SUV和四门轿车模型',
      template: {
        customerPersonality: ['务实', '家庭责任', '平衡考虑'],
        customerProfession: '中高管',
        customerCommunication: 'S稳定型',
        customerHobbies: ['家庭活动', '旅行'],
        customerGender: '男',
        customerAge: '35-50',
        customerFocus: ['实用性', '安全性', '舒适度']
      }
    },
    {
      name: '节俭型豪华消费者',
      description: '精打细算购买入门级保时捷，详细研究二手市场，关注车辆保值率',
      template: {
        customerPersonality: ['精明', '节俭', '理性'],
        customerProfession: '小企业主',
        customerCommunication: 'C遵循型',
        customerHobbies: ['理财', '投资'],
        customerGender: '男',
        customerAge: '30-55',
        customerFocus: ['保值率', '运营成本', '入门配置']
      }
    },
    {
      name: '品牌跨界尝鲜者',
      description: '拥有其他豪华品牌车辆后尝试保时捷，决策基于品牌对比和差异化体验',
      template: {
        customerPersonality: ['好奇', '体验导向', '追求新鲜'],
        customerProfession: '汽车爱好者',
        customerCommunication: 'I影响型',
        customerHobbies: ['汽车体验', '品牌研究'],
        customerGender: '男',
        customerAge: '35-55',
        customerFocus: ['品牌差异', '独特体验', '驾驶感受']
      }
    }
  ]);

  // 冲突检测规则
  const conflictRules = {
    taskGoalMethodology: {
      '小米SU7竞品对比': ['RACE竞品对比介绍'],
      '991-2产品介绍': ['FAB产品介绍技巧'],
      '客户需求挖掘': ['SPIN销售法'],
      '金融方案销售': ['顾问式销售'],
      '试驾邀约': ['顾问式销售', 'SPIN销售法']
    },
    communicationPersonality: {
      'D控制型': ['强势', '主导权', '独立'],
      'I影响型': ['积极表达', '相信朋友', '喜欢案例'],
      'C遵循型': ['服从权威', '数据导向', '理性'],
      'S稳定型': ['犹豫', '隐藏需求']
    },
    vehicleConflicts: {
      currentVsInterested: true, // 现驾车型不能与意向车型相同
      competitorCurrentVsInterested: true // 竞品现驾不能与竞品意向相同
    }
  };

  // 检测冲突
  const detectConflicts = (config: typeof taskConfig) => {
    const warnings: string[] = [];

    // 任务目标与方法论匹配检查
    if (config.taskGoal && config.methodology) {
      const recommendedMethods = conflictRules.taskGoalMethodology[config.taskGoal as keyof typeof conflictRules.taskGoalMethodology];
      if (recommendedMethods && !recommendedMethods.includes(config.methodology)) {
        warnings.push(`任务目标"${config.taskGoal}"建议使用方法论：${recommendedMethods.join('或')}`);
      }
    }

    // 沟通方式与性格特征匹配检查
    if (config.customerCommunication && config.customerPersonality.length > 0) {
      const recommendedTraits = conflictRules.communicationPersonality[config.customerCommunication as keyof typeof conflictRules.communicationPersonality];
      if (recommendedTraits) {
        const hasMatchingTrait = config.customerPersonality.some(trait => recommendedTraits.includes(trait));
        if (!hasMatchingTrait) {
          warnings.push(`沟通方式"${config.customerCommunication}"建议搭配性格特征：${recommendedTraits.join('、')}`);
        }
      }
    }

    // 车型冲突检查
    if (config.currentVehicle && config.interestedVehicle && config.currentVehicle === config.interestedVehicle) {
      warnings.push('现驾车型与意向车型不能相同');
    }

    if (config.competitorCurrent && config.competitorInterested && config.competitorCurrent === config.competitorInterested) {
      warnings.push('竞品现驾车型与竞品意向车型不能相同');
    }

    return warnings;
  };

  // 获取禁用选项
  const getDisabledOptions = (field: string, value: string) => {
    const config = taskConfig;
    
    switch (field) {
      case 'methodology':
        if (config.taskGoal) {
          const recommended = conflictRules.taskGoalMethodology[config.taskGoal as keyof typeof conflictRules.taskGoalMethodology];
          return recommended ? !recommended.includes(value) : false;
        }
        return false;
      
      case 'interestedVehicle':
        return config.currentVehicle === value;
      
      case 'competitorInterested':
        return config.competitorCurrent === value;
      
      default:
        return false;
    }
  };

  // 使用useEffect监听配置变化，实时检测冲突
  useEffect(() => {
    const warnings = detectConflicts(taskConfig);
    setConflictWarnings(warnings);
  }, [taskConfig]);

  // 点击外部区域关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowRandomOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const generatePrompt = async () => {
    try {
      // 调用后端API生成智能优化的prompt
      const response = await fetch(getApiUrl('/api/ai/generate-prompt'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskConfig)
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedPrompt(data.prompt);
      } else {
        // 如果API调用失败，使用原来的简单拼接方式作为备选
        const trainingFocusText = taskConfig.trainingFocus.length > 0 
          ? `\n## 训练重点\n本次对话将重点训练以下维度：${taskConfig.trainingFocus.join('、')}\n请在对话中特别关注这些方面的表现。`
          : '';

        const prompt = `
# AI客户角色设定

## 任务目标
${taskConfig.taskGoal || '未设置'}

## 销售方法论
${taskConfig.methodology || '未设置'}${trainingFocusText}

## 客户基本信息
- **姓名**: 请自行设定一个符合背景的中文姓名
- **职业**: ${taskConfig.customerProfession || '未设置'}
- **性别**: ${taskConfig.customerGender || '未设置'}
- **年龄**: ${taskConfig.customerAge || '未设置'}
- **性格特征**: ${taskConfig.customerPersonality.join('、') || '未设置'}
- **沟通方式**: ${taskConfig.customerCommunication || '未设置'}
- **兴趣爱好**: ${taskConfig.customerHobbies.join('、') || '未设置'}

## 车辆信息
- **现驾车型**: ${taskConfig.currentVehicle || '未设置'}
- **意向车型**: ${taskConfig.interestedVehicle || '未设置'}
- **关注重点**: ${taskConfig.customerFocus.join('、') || '未设置'}

## 竞品信息
- **竞品现驾**: ${taskConfig.competitorCurrent || '未设置'}
- **竞品意向**: ${taskConfig.competitorInterested || '未设置'}
- **竞品关注点**: ${taskConfig.competitorFocus.join('、') || '未设置'}

## 交易信息
- **谈判阶段**: ${taskConfig.negotiationStage || '未设置'}
- **交易顾虑**: ${taskConfig.transactionConcerns.join('、') || '未设置'}

## 角色扮演要求
请根据以上信息扮演一位对保时捷感兴趣的客户，在对话中：
1. 保持角色的一致性和真实性
2. 根据性格特征和沟通方式调整对话风格
3. 适当展现对车型的了解程度和购买意向
4. 在适当时机提出相关问题和顾虑
5. 根据销售人员的表现给出相应的反应

请开始角色扮演，首先进行自我介绍并表达来意。
        `;
        setGeneratedPrompt(prompt);
      }
    } catch (error) {
      console.error('生成Prompt失败:', error);
      // 使用备选方案
      const prompt = `基于当前配置生成的AI客户角色Prompt...`;
      setGeneratedPrompt(prompt);
    }
  };

  const randomSelectAll = () => {
    // 随机选择函数
    const randomChoice = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const randomChoices = (arr: string[], count: number) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, Math.min(count, arr.length));
    };

    // 所有选项数组
    const taskGoals = ['991-2产品介绍', '小米SU7竞品对比', '客户需求挖掘', '金融方案销售', '试驾邀约'];
    const methodologies = ['FAB产品介绍技巧', 'RACE竞品对比介绍', 'SPIN销售法', '顾问式销售'];
    const personalities = ['强势', '主导权', '独立', '积极表达', '相信朋友', '喜欢案例', '服从权威', '数据导向', '理性', '犹豫', '隐藏需求'];
    const professions = ['企业家', '医生', '律师', '工程师', '金融分析师', '设计师', '教授', '咨询师'];
    const communications = ['D控制型', 'I影响型', 'S稳定型', 'C遵循型'];
    const hobbies = ['高尔夫', '网球', '滑雪', '摄影', '旅行', '音乐', '艺术收藏', '红酒品鉴'];
    const genders = ['男', '女'];
    const ages = ['25-35', '35-45', '45-55', '55-65'];
    const currentVehicles = ['宝马X5', '奥迪Q7', '奔驰GLE', '雷克萨斯RX', '沃尔沃XC90'];
    const interestedVehicles = ['Cayenne', 'Macan', 'Panamera', '911', 'Taycan'];
    const focuses = ['动力性能', '豪华配置', '科技功能', '安全性', '舒适性', '操控性', '品牌价值'];
    const competitorCurrents = ['宝马i4', '奔驰EQE', '奥迪e-tron GT', '特斯拉Model S'];
    const competitorInteresteds = ['小米SU7', '理想L9', '蔚来ET7', '比亚迪汉EV'];
    const negotiationStages = ['初次接触', '需求了解', '产品介绍', '试驾体验', '价格谈判', '成交准备'];
    const transactionConcerns = ['价格', '保值率', '维修成本', '保险费用', '充电便利性', '品牌认知'];
    const trainingFocuses = ['沟通维度', '本品维度', '竞品维度', '客户信息获取维度'];

    // 智能选择：避免冲突的配置组合
    const selectedTaskGoal = randomChoice(taskGoals);
    let selectedMethodology = randomChoice(methodologies);
    
    // 根据任务目标智能匹配方法论
    const taskMethodologyMap: { [key: string]: string[] } = {
      '小米SU7竞品对比': ['RACE竞品对比介绍'],
      '991-2产品介绍': ['FAB产品介绍技巧'],
      '客户需求挖掘': ['SPIN销售法'],
      '金融方案销售': ['顾问式销售'],
      '试驾邀约': ['顾问式销售', 'SPIN销售法']
    };
    
    if (taskMethodologyMap[selectedTaskGoal]) {
      selectedMethodology = randomChoice(taskMethodologyMap[selectedTaskGoal]);
    }

    // 智能选择沟通方式和性格特征的匹配
    const selectedCommunication = randomChoice(communications);
    let selectedPersonalities = randomChoices(personalities, Math.floor(Math.random() * 4) + 1);
    
    const communicationPersonalityMap: { [key: string]: string[] } = {
      'D控制型': ['强势', '主导权', '独立'],
      'I影响型': ['积极表达', '相信朋友', '喜欢案例'],
      'C遵循型': ['服从权威', '数据导向', '理性'],
      'S稳定型': ['犹豫', '隐藏需求']
    };
    
    if (communicationPersonalityMap[selectedCommunication]) {
      // 确保至少包含一个匹配的性格特征
      const matchingTraits = communicationPersonalityMap[selectedCommunication];
      const randomMatchingTrait = randomChoice(matchingTraits);
      selectedPersonalities = [randomMatchingTrait, ...randomChoices(personalities.filter(p => p !== randomMatchingTrait), Math.floor(Math.random() * 2))];
    }

    // 避免车型冲突
    const selectedCurrentVehicle = randomChoice(currentVehicles);
    const availableInterestedVehicles = interestedVehicles.filter(v => v !== selectedCurrentVehicle);
    const selectedInterestedVehicle = randomChoice(availableInterestedVehicles);

    const selectedCompetitorCurrent = randomChoice(competitorCurrents);
    const availableCompetitorInterested = competitorInteresteds.filter(v => v !== selectedCompetitorCurrent);
    const selectedCompetitorInterested = randomChoice(availableCompetitorInterested);

    setTaskConfig({
      taskGoal: selectedTaskGoal,
      methodology: selectedMethodology,
      trainingFocus: randomChoices(trainingFocuses, Math.floor(Math.random() * 2) + 1),
      customerType: '', // 重置客户类型，让系统自动推荐
      customerPersonality: selectedPersonalities,
      customerProfession: randomChoice(professions),
      customerCommunication: selectedCommunication,
      customerHobbies: randomChoices(hobbies, Math.floor(Math.random() * 3) + 1),
      customerGender: randomChoice(genders),
      customerAge: randomChoice(ages),
      currentVehicle: selectedCurrentVehicle,
      interestedVehicle: selectedInterestedVehicle,
      customerFocus: randomChoices(focuses, Math.floor(Math.random() * 3) + 1),
      competitorCurrent: selectedCompetitorCurrent,
      competitorInterested: selectedCompetitorInterested,
      competitorFocus: randomChoices(focuses, Math.floor(Math.random() * 3) + 1),
      negotiationStage: randomChoice(negotiationStages),
      transactionConcerns: randomChoices(transactionConcerns, Math.floor(Math.random() * 3) + 1)
    });
  };

  const updateConfig = (key: string, value: any) => {
    setTaskConfig(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayValue = (key: string, value: string) => {
    setTaskConfig(prev => ({
      ...prev,
      [key]: (prev[key as keyof typeof prev] as string[]).includes(value)
        ? (prev[key as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[key as keyof typeof prev] as string[]), value]
    }));
  };

  const startPractice = () => {
    if (!generatedPrompt) {
      alert('请先生成AI角色Prompt');
      return;
    }
    
    // 编码配置和prompt参数
    const configParam = encodeURIComponent(JSON.stringify(taskConfig));
    const promptParam = encodeURIComponent(generatedPrompt);
    
    // 跳转到练习对话页面
    window.location.href = `/practice-chat?config=${configParam}&prompt=${promptParam}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <div>
                <Link href="/" className="text-xl font-bold gradient-text hover:opacity-80 transition-opacity">
                  AI Mentor工具
                </Link>
                <span className="text-xs text-muted-foreground block">任务生成界面</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/practice-chat" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                学员对话
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                数据面板
              </Link>
              <Link href="/mentor-evaluation" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                导师评估
              </Link>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">M</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">任务生成界面</h1>
              <p className="text-gray-600">通过智能配置生成个性化的AI客户角色和销售场景</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* 客户画像选择 */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowRandomOptions(!showRandomOptions)}
                  className="btn-secondary inline-flex items-center group"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  选择客户画像
                  <svg className="w-4 h-4 ml-2 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showRandomOptions && (
                  <div className="absolute top-full left-0 mt-2 w-80 card-glass border border-white/20 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-4">
                      <div className="text-sm text-gray-600 p-3 border-b border-gray-200 mb-3">
                        选择一个保时捷客户画像模板，系统将自动填充相应配置
                      </div>
                      {customerTypes.map((type, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            // 应用模板到当前配置
                            setTaskConfig(prev => ({
                              ...prev,
                              customerType: type.name,
                              customerPersonality: type.template.customerPersonality,
                              customerProfession: type.template.customerProfession,
                              customerCommunication: type.template.customerCommunication,
                              customerHobbies: type.template.customerHobbies,
                              customerGender: type.template.customerGender,
                              customerAge: type.template.customerAge,
                              customerFocus: type.template.customerFocus
                            }));
                            setShowRandomOptions(false);
                          }}
                          className="w-full text-left p-3 hover:bg-gray-50 rounded-lg border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-gray-900 mb-1">{type.name}</div>
                          <div className="text-sm text-gray-600 mb-2">{type.description}</div>
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {type.template.customerCommunication}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {type.template.customerProfession}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {type.template.customerGender} {type.template.customerAge}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={randomSelectAll}
                className="btn-secondary inline-flex items-center group"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                完全随机
              </button>
              
              <button
                onClick={generatePrompt}
                className="btn-primary inline-flex items-center group"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                生成AI角色Prompt
              </button>
            </div>
          </div>

          {/* Conflict Warnings */}
          {conflictWarnings.length > 0 && (
            <div className={`card-glass p-4 border-l-4 border-yellow-400 bg-yellow-50 transition-all duration-500 ${isLoaded ? 'animate-fade-in' : ''}`} style={{animationDelay: '0.1s'}}>
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-sm font-medium text-yellow-800">配置冲突提醒</h3>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {conflictWarnings.map((warning, index) => (
                  <li key={index} className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Configuration Panel */}
            <div className="space-y-6">
              {/* Task Goal */}
              <div className={`card-glass p-6 transition-all duration-500 ${isLoaded ? 'animate-fade-in' : ''}`} style={{animationDelay: '0.2s'}}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  任务目标
                </h3>
                <select
                  value={taskConfig.taskGoal}
                  onChange={(e) => updateConfig('taskGoal', e.target.value)}
                  className="input w-full"
                >
                  <option value="">请选择任务目标</option>
                  <option value="991-2产品介绍">991-2产品介绍</option>
                  <option value="小米SU7竞品对比">小米SU7竞品对比</option>
                  <option value="客户需求挖掘">客户需求挖掘</option>
                  <option value="金融方案销售">金融方案销售</option>
                  <option value="试驾邀约">试驾邀约</option>
                </select>
              </div>

              {/* Methodology */}
              <div className={`card-glass p-6 transition-all duration-500 ${isLoaded ? 'animate-fade-in' : ''}`} style={{animationDelay: '0.3s'}}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  销售方法论
                </h3>
                <select
                  value={taskConfig.methodology}
                  onChange={(e) => updateConfig('methodology', e.target.value)}
                  className="input w-full"
                >
                  <option value="">请选择销售方法论</option>
                  <option value="FAB产品介绍技巧" disabled={getDisabledOptions('methodology', 'FAB产品介绍技巧')}>
                    FAB产品介绍技巧
                  </option>
                  <option value="RACE竞品对比介绍" disabled={getDisabledOptions('methodology', 'RACE竞品对比介绍')}>
                    RACE竞品对比介绍
                  </option>
                  <option value="SPIN销售法" disabled={getDisabledOptions('methodology', 'SPIN销售法')}>
                    SPIN销售法
                  </option>
                  <option value="顾问式销售" disabled={getDisabledOptions('methodology', '顾问式销售')}>
                    顾问式销售
                  </option>
                </select>
              </div>

              {/* Customer Information */}
              <div className={`card-glass p-6 transition-all duration-500 ${isLoaded ? 'animate-fade-in' : ''}`} style={{animationDelay: '0.4s'}}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  客户信息
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">职业</label>
                      <select
                        value={taskConfig.customerProfession}
                        onChange={(e) => updateConfig('customerProfession', e.target.value)}
                        className="input w-full"
                      >
                        <option value="">请选择职业</option>
                        <option value="企业家">企业家</option>
                        <option value="医生">医生</option>
                        <option value="律师">律师</option>
                        <option value="工程师">工程师</option>
                        <option value="金融分析师">金融分析师</option>
                        <option value="设计师">设计师</option>
                        <option value="教授">教授</option>
                        <option value="咨询师">咨询师</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">沟通方式</label>
                      <select
                        value={taskConfig.customerCommunication}
                        onChange={(e) => updateConfig('customerCommunication', e.target.value)}
                        className="input w-full"
                      >
                        <option value="">请选择沟通方式</option>
                        <option value="D控制型">D控制型</option>
                        <option value="I影响型">I影响型</option>
                        <option value="S稳定型">S稳定型</option>
                        <option value="C遵循型">C遵循型</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
                      <select
                        value={taskConfig.customerGender}
                        onChange={(e) => updateConfig('customerGender', e.target.value)}
                        className="input w-full"
                      >
                        <option value="">请选择性别</option>
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">年龄</label>
                      <select
                        value={taskConfig.customerAge}
                        onChange={(e) => updateConfig('customerAge', e.target.value)}
                        className="input w-full"
                      >
                        <option value="">请选择年龄</option>
                        <option value="25-35">25-35</option>
                        <option value="35-45">35-45</option>
                        <option value="45-55">45-55</option>
                        <option value="55-65">55-65</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">性格特征</label>
                    <div className="flex flex-wrap gap-2">
                      {['强势', '主导权', '独立', '积极表达', '相信朋友', '喜欢案例', '服从权威', '数据导向', '理性', '犹豫', '隐藏需求'].map(trait => (
                        <button
                          key={trait}
                          onClick={() => toggleArrayValue('customerPersonality', trait)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            taskConfig.customerPersonality.includes(trait)
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {trait}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className={`card-glass p-6 transition-all duration-500 ${isLoaded ? 'animate-fade-in' : ''}`} style={{animationDelay: '0.5s'}}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                  车辆信息
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">现驾车型</label>
                      <select
                        value={taskConfig.currentVehicle}
                        onChange={(e) => updateConfig('currentVehicle', e.target.value)}
                        className="input w-full"
                      >
                        <option value="">请选择现驾车型</option>
                        <option value="宝马X5">宝马X5</option>
                        <option value="奥迪Q7">奥迪Q7</option>
                        <option value="奔驰GLE">奔驰GLE</option>
                        <option value="雷克萨斯RX">雷克萨斯RX</option>
                        <option value="沃尔沃XC90">沃尔沃XC90</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">意向车型</label>
                      <select
                        value={taskConfig.interestedVehicle}
                        onChange={(e) => updateConfig('interestedVehicle', e.target.value)}
                        className="input w-full"
                      >
                        <option value="">请选择意向车型</option>
                        <option value="Cayenne" disabled={getDisabledOptions('interestedVehicle', 'Cayenne')}>Cayenne</option>
                        <option value="Macan" disabled={getDisabledOptions('interestedVehicle', 'Macan')}>Macan</option>
                        <option value="Panamera" disabled={getDisabledOptions('interestedVehicle', 'Panamera')}>Panamera</option>
                        <option value="911" disabled={getDisabledOptions('interestedVehicle', '911')}>911</option>
                        <option value="Taycan" disabled={getDisabledOptions('interestedVehicle', 'Taycan')}>Taycan</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Prompt Panel */}
            <div className="space-y-6">
              <div className={`card-glass p-6 transition-all duration-500 ${isLoaded ? 'animate-fade-in' : ''}`} style={{animationDelay: '0.6s'}}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                    生成的AI角色Prompt
                  </h3>
                  {generatedPrompt && (
                    <button
                      onClick={startPractice}
                      className="btn-primary inline-flex items-center text-sm"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1M9 6h6" />
                      </svg>
                      开始练习
                    </button>
                  )}
                </div>
                
                {generatedPrompt ? (
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                      {generatedPrompt}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-gray-500 text-sm">
                      请配置任务参数，然后点击"生成AI角色Prompt"按钮
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className={`card-glass p-6 transition-all duration-500 ${isLoaded ? 'animate-fade-in' : ''}`} style={{animationDelay: '0.7s'}}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                  快速操作
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/practice-chat"
                    className="btn-secondary w-full inline-flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    直接进入对话练习
                  </Link>
                  <Link
                    href="/dashboard"
                    className="btn-secondary w-full inline-flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    查看数据面板
                  </Link>
                  <Link
                    href="/mentor-evaluation"
                    className="btn-secondary w-full inline-flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    导师评估界面
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
