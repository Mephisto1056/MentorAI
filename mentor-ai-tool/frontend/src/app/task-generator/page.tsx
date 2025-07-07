'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TaskGenerator() {
  const [taskConfig, setTaskConfig] = useState({
    taskGoal: '',
    methodology: '',
    trainingFocus: [] as string[], // 新增：训练重点
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

  const generatePrompt = () => {
    const trainingFocusText = taskConfig.trainingFocus.length > 0 
      ? `\n## 训练重点\n本次对话将重点训练以下维度：${taskConfig.trainingFocus.join('、')}\n请在对话中特别关注这些方面的表现。`
      : '';

    const prompt = `
# AI客户角色设定

## 任务目标
${taskConfig.taskGoal || '未设置'}

## 销售方法论
${taskConfig.methodology || '未设置'}${trainingFocusText}

## 客户画像
- **性格特征**: ${taskConfig.customerPersonality.join('、') || '未设置'}
- **职业背景**: ${taskConfig.customerProfession || '未设置'}
- **沟通方式**: ${taskConfig.customerCommunication || '未设置'}
- **兴趣爱好**: ${taskConfig.customerHobbies.join('、') || '未设置'}
- **性别年龄**: ${taskConfig.customerGender} ${taskConfig.customerAge}

## 本品维度
- **现驾车型**: ${taskConfig.currentVehicle || '未设置'}
- **意向车型**: ${taskConfig.interestedVehicle || '未设置'}
- **关注重点**: ${taskConfig.customerFocus.join('、') || '未设置'}

## 竞品维度
- **现驾车型**: ${taskConfig.competitorCurrent || '未设置'}
- **意向车型**: ${taskConfig.competitorInterested || '未设置'}
- **关注重点**: ${taskConfig.competitorFocus.join('、') || '未设置'}

## 交易相关
- **洽谈环节**: ${taskConfig.negotiationStage || '未设置'}
- **交易关注点**: ${taskConfig.transactionConcerns.join('、') || '未设置'}

请根据以上设定扮演一位真实的客户，与销售顾问进行自然对话。
${taskConfig.trainingFocus.length > 0 ? `
特别注意：
${taskConfig.trainingFocus.includes('沟通维度') ? '- 根据你的沟通方式特点进行对话，测试销售顾问的沟通适应能力\n' : ''}${taskConfig.trainingFocus.includes('本品维度') ? '- 重点询问产品相关问题，测试销售顾问的产品知识和优势展示能力\n' : ''}${taskConfig.trainingFocus.includes('竞品维度') ? '- 主动提及竞品对比，测试销售顾问的竞品分析和差异化说明能力\n' : ''}${taskConfig.trainingFocus.includes('客户信息获取维度') ? '- 适度隐藏个人信息，测试销售顾问的信息挖掘和需求识别能力\n' : ''}` : ''}
    `;
    setGeneratedPrompt(prompt);
  };

  const randomSelectAll = () => {
    // 随机选择所有配置项
    const taskGoals = ['小米SU7竞品对比', '991-2产品介绍', '客户需求挖掘', '金融方案销售', '试驾邀约'];
    const methodologies = ['FAB产品介绍技巧', 'RACE竞品对比介绍', 'SPIN销售法', '顾问式销售'];
    const personalities = ['独立', '犹豫', '理性', '强势', '相信朋友', '数据导向', '主导权', '隐藏需求', '喜欢案例', '积极表达', '易信网络', '服从权威'];
    const professions = ['金融分析', '网络直播', '冲压工厂', '电子配件生产', '医生', '律师', '教师', '工程师'];
    const communications = ['D控制型', 'I影响型', 'C遵循型', 'S稳定型'];
    const hobbies = ['高尔夫', '旅游', '乒乓球', '网球', '阅读', '音乐', '摄影', '健身'];
    const genders = ['男', '女'];
    const ages = ['20-30', '30-40', '40-50', '50-60'];
    const currentVehicles = ['无', 'G2-1', 'E2-1', '991-2'];
    const interestedVehicles = ['G3-1', '982-Boxster', 'E3-1', 'Taycan J2'];
    const focuses = ['外观', '动力', '内饰', '智能化', '充电', '残值'];
    const competitorCurrents = ['BMW X5', 'AUDI A7', 'Benz S480', 'Volvo S80'];
    const competitorInteresteds = ['SU 7', '理想L9', 'Benz GLS'];
    const negotiationStages = ['产品介绍', '试乘试驾', '交易洽谈'];
    const transactionConcerns = ['价格优惠', '赠送附件', '按揭优惠', '服务体验', '价格对比'];

    // 随机选择函数
    const randomChoice = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const randomChoices = (arr: string[], count: number = Math.floor(Math.random() * 3) + 1) => {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    const trainingFocuses = ['沟通维度', '本品维度', '竞品维度', '客户信息获取维度'];

    setTaskConfig({
      taskGoal: randomChoice(taskGoals),
      methodology: randomChoice(methodologies),
      trainingFocus: randomChoices(trainingFocuses, Math.floor(Math.random() * 2) + 1),
      customerPersonality: randomChoices(personalities, Math.floor(Math.random() * 4) + 1),
      customerProfession: randomChoice(professions),
      customerCommunication: randomChoice(communications),
      customerHobbies: randomChoices(hobbies, Math.floor(Math.random() * 3) + 1),
      customerGender: randomChoice(genders),
      customerAge: randomChoice(ages),
      currentVehicle: randomChoice(currentVehicles),
      interestedVehicle: randomChoice(interestedVehicles),
      customerFocus: randomChoices(focuses, Math.floor(Math.random() * 3) + 1),
      competitorCurrent: randomChoice(competitorCurrents),
      competitorInterested: randomChoice(competitorInteresteds),
      competitorFocus: randomChoices(focuses, Math.floor(Math.random() * 3) + 1),
      negotiationStage: randomChoice(negotiationStages),
      transactionConcerns: randomChoices(transactionConcerns, Math.floor(Math.random() * 3) + 1)
    });
  };

  const randomGeneratePrompt = () => {
    randomSelectAll();
    // 延迟一点时间确保状态更新完成，然后生成prompt
    setTimeout(() => {
      generatePrompt();
    }, 100);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                AI Mentor工具
              </Link>
              <span className="ml-2 text-sm text-gray-500">任务生成界面</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/practice-chat" className="text-sm text-gray-600 hover:text-blue-600">
                学员对话
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">
                数据面板
              </Link>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">M</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">任务生成界面</h2>
            <div className="flex space-x-3">
              <button 
                onClick={randomGeneratePrompt}
                className="bg-orange-600 text-white px-6 py-2 rounded-md hover:bg-orange-700 flex items-center"
              >
                <span className="mr-2">🎲</span>
                一键随机生成Prompt
              </button>
              <button 
                onClick={generatePrompt}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                生成AI角色Prompt
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 配置面板 */}
            <div className="space-y-6">
              {/* 任务目标 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">任务目标</h3>
                <select 
                  value={taskConfig.taskGoal}
                  onChange={(e) => updateConfig('taskGoal', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">请选择任务目标</option>
                  <option value="小米SU7竞品对比">小米SU7竞品对比</option>
                  <option value="991-2产品介绍">991-2产品介绍</option>
                  <option value="客户需求挖掘">客户需求挖掘</option>
                  <option value="金融方案销售">金融方案销售</option>
                  <option value="试驾邀约">试驾邀约</option>
                </select>
              </div>

              {/* 方法论 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">方法论</h3>
                <select 
                  value={taskConfig.methodology}
                  onChange={(e) => updateConfig('methodology', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">请选择方法论</option>
                  {['FAB产品介绍技巧', 'RACE竞品对比介绍', 'SPIN销售法', '顾问式销售'].map(method => (
                    <option 
                      key={method} 
                      value={method}
                      disabled={getDisabledOptions('methodology', method)}
                      className={getDisabledOptions('methodology', method) ? 'text-gray-400' : ''}
                    >
                      {method}
                    </option>
                  ))}
                </select>
              </div>

              {/* 训练重点选择 */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  训练重点维度
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: '沟通维度', desc: '沟通方式识别、匹配、引导能力' },
                    { key: '本品维度', desc: '产品知识、优势展示、需求匹配' },
                    { key: '竞品维度', desc: '竞品分析、差异化对比能力' },
                    { key: '客户信息获取维度', desc: '信息挖掘、性格识别能力' }
                  ].map(focus => (
                    <label key={focus.key} className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={taskConfig.trainingFocus.includes(focus.key)}
                        onChange={() => toggleArrayValue('trainingFocus', focus.key)}
                        className="mr-3 mt-1"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">{focus.key}</span>
                        <p className="text-xs text-gray-500 mt-1">{focus.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 冲突警告 */}
              {conflictWarnings.length > 0 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-400">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">配置建议</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc list-inside space-y-1">
                          {conflictWarnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 客户维度 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">客户维度</h3>
                <div className="space-y-4">
                  {/* 客户性格 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">客户性格</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['独立', '犹豫', '理性', '强势', '相信朋友', '数据导向', '主导权', '隐藏需求', '喜欢案例', '积极表达', '易信网络', '服从权威'].map(trait => (
                        <label key={trait} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={taskConfig.customerPersonality.includes(trait)}
                            onChange={() => toggleArrayValue('customerPersonality', trait)}
                            className="mr-2"
                          />
                          <span className="text-sm">{trait}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 客户职业 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">客户职业</label>
                    <select 
                      value={taskConfig.customerProfession}
                      onChange={(e) => updateConfig('customerProfession', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">请选择职业</option>
                      <option value="金融分析">金融分析</option>
                      <option value="网络直播">网络直播</option>
                      <option value="冲压工厂">冲压工厂</option>
                      <option value="电子配件生产">电子配件生产</option>
                      <option value="医生">医生</option>
                      <option value="律师">律师</option>
                      <option value="教师">教师</option>
                      <option value="工程师">工程师</option>
                    </select>
                  </div>

                  {/* 客户沟通方式 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">客户沟通方式</label>
                    <select 
                      value={taskConfig.customerCommunication}
                      onChange={(e) => updateConfig('customerCommunication', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">请选择沟通方式</option>
                      <option value="D控制型">D控制型</option>
                      <option value="I影响型">I影响型</option>
                      <option value="C遵循型">C遵循型</option>
                      <option value="S稳定型">S稳定型</option>
                    </select>
                  </div>

                  {/* 客户爱好 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">客户爱好</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['高尔夫', '旅游', '乒乓球', '网球', '阅读', '音乐', '摄影', '健身'].map(hobby => (
                        <label key={hobby} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={taskConfig.customerHobbies.includes(hobby)}
                            onChange={() => toggleArrayValue('customerHobbies', hobby)}
                            className="mr-2"
                          />
                          <span className="text-sm">{hobby}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* 客户性别和年龄 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">客户性别</label>
                      <select 
                        value={taskConfig.customerGender}
                        onChange={(e) => updateConfig('customerGender', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">请选择</option>
                        <option value="男">男</option>
                        <option value="女">女</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">客户年龄</label>
                      <select 
                        value={taskConfig.customerAge}
                        onChange={(e) => updateConfig('customerAge', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">请选择</option>
                        <option value="20-30">20-30</option>
                        <option value="30-40">30-40</option>
                        <option value="40-50">40-50</option>
                        <option value="50-60">50-60</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 本品维度 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">本品维度</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">现驾车型</label>
                      <select 
                        value={taskConfig.currentVehicle}
                        onChange={(e) => updateConfig('currentVehicle', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">请选择</option>
                        <option value="无">无</option>
                        <option value="G2-1">G2-1</option>
                        <option value="E2-1">E2-1</option>
                        <option value="991-2">991-2</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">意向车型</label>
                      <select 
                        value={taskConfig.interestedVehicle}
                        onChange={(e) => updateConfig('interestedVehicle', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">请选择</option>
                        <option value="G3-1">G3-1</option>
                        <option value="982-Boxster">982-Boxster</option>
                        <option value="E3-1">E3-1</option>
                        <option value="Taycan J2">Taycan J2</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">客户关注点</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['外观', '动力', '内饰', '智能化', '充电', '残值'].map(focus => (
                        <label key={focus} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={taskConfig.customerFocus.includes(focus)}
                            onChange={() => toggleArrayValue('customerFocus', focus)}
                            className="mr-2"
                          />
                          <span className="text-sm">{focus}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 竞品维度 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">竞品维度</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">现驾车型</label>
                      <select 
                        value={taskConfig.competitorCurrent}
                        onChange={(e) => updateConfig('competitorCurrent', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">请选择</option>
                        <option value="BMW X5">BMW X5</option>
                        <option value="AUDI A7">AUDI A7</option>
                        <option value="Benz S480">Benz S480</option>
                        <option value="Volvo S80">Volvo S80</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">意向车型</label>
                      <select 
                        value={taskConfig.competitorInterested}
                        onChange={(e) => updateConfig('competitorInterested', e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="">请选择</option>
                        <option value="SU 7">SU 7</option>
                        <option value="理想L9">理想L9</option>
                        <option value="Benz GLS">Benz GLS</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">竞品关注点</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['外观', '动力', '内饰', '智能化', '充电', '残值'].map(focus => (
                        <label key={focus} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={taskConfig.competitorFocus.includes(focus)}
                            onChange={() => toggleArrayValue('competitorFocus', focus)}
                            className="mr-2"
                          />
                          <span className="text-sm">{focus}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 交易相关 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">交易相关</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">洽谈环节</label>
                    <select 
                      value={taskConfig.negotiationStage}
                      onChange={(e) => updateConfig('negotiationStage', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="">请选择</option>
                      <option value="产品介绍">产品介绍</option>
                      <option value="试乘试驾">试乘试驾</option>
                      <option value="交易洽谈">交易洽谈</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">交易关注点</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['价格优惠', '赠送附件', '按揭优惠', '服务体验', '价格对比'].map(concern => (
                        <label key={concern} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={taskConfig.transactionConcerns.includes(concern)}
                            onChange={() => toggleArrayValue('transactionConcerns', concern)}
                            className="mr-2"
                          />
                          <span className="text-sm">{concern}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 生成的Prompt预览 */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">生成的AI角色Prompt</h3>
                <button 
                  onClick={randomSelectAll}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center text-sm"
                >
                  <span className="mr-1">🎲</span>
                  随机选择
                </button>
              </div>
              <div className="bg-gray-50 rounded-md p-4 h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {generatedPrompt || '点击"生成AI角色Prompt"按钮来生成角色设定...'}
                </pre>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                  保存模板
                </button>
                <Link 
                  href={`/practice-chat${generatedPrompt ? `?config=${encodeURIComponent(JSON.stringify(taskConfig))}&prompt=${encodeURIComponent(generatedPrompt)}` : ''}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block text-center"
                >
                  发送邮件至邮箱
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
