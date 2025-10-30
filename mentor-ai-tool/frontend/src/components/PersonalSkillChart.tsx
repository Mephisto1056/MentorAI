'use client';

import { useState } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

// 个人技能评分数据 - AI评分 vs 自我评估
const personalSkillData = [
  { skill: '车型配置介绍', aiScore: 92, selfScore: 88, sessions: 15, category: 'product' },
  { skill: '客户需求挖掘', aiScore: 88, selfScore: 85, sessions: 12, category: 'communication' },
  { skill: '试驾引导', aiScore: 85, selfScore: 90, sessions: 8, category: 'service' },
  { skill: '价格谈判', aiScore: 75, selfScore: 70, sessions: 10, category: 'sales' },
  { skill: '金融方案推荐', aiScore: 78, selfScore: 75, sessions: 6, category: 'finance' },
  { skill: '售后服务介绍', aiScore: 72, selfScore: 78, sessions: 5, category: 'service' },
  { skill: '异议处理', aiScore: 80, selfScore: 75, sessions: 9, category: 'sales' },
  { skill: '成交技巧', aiScore: 82, selfScore: 80, sessions: 7, category: 'sales' },
  { skill: '客户关系维护', aiScore: 86, selfScore: 88, sessions: 11, category: 'communication' },
  { skill: '竞品对比分析', aiScore: 79, selfScore: 82, sessions: 4, category: 'product' },
];

// 自定义Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{data.skill}</p>
        <p className="text-sm text-blue-600">AI评分: {data.aiScore}分</p>
        <p className="text-sm text-green-600">自我评估: {data.selfScore}分</p>
        <p className="text-sm text-gray-500">练习次数: {data.sessions}次</p>
        <p className="text-xs text-gray-400 mt-1">
          差值: {Math.abs(data.selfScore - data.aiScore)} 分
        </p>
      </div>
    );
  }
  return null;
};

// 根据技能类别确定颜色
const getCategoryColor = (category: string) => {
  const colors = {
    'product': '#3B82F6', // 蓝色 - 产品知识
    'communication': '#10B981', // 绿色 - 沟通技巧
    'sales': '#F59E0B', // 黄色 - 销售技巧
    'service': '#8B5CF6', // 紫色 - 服务技巧
    'finance': '#EF4444', // 红色 - 金融知识
  };
  return colors[category as keyof typeof colors] || '#6B7280';
};

// 根据评分差异确定点的大小
const getPointSize = (sessions: number) => {
  return Math.max(40, Math.min(120, sessions * 8)); // 根据练习次数调整点的大小
};

interface PersonalSkillChartProps {
  isLargeView?: boolean;
}

export default function PersonalSkillChart({ 
  isLargeView = false 
}: PersonalSkillChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const chartHeight = isLargeView ? 500 : 240;
  
  // 过滤数据
  const filteredData = selectedCategory 
    ? personalSkillData.filter(item => item.category === selectedCategory)
    : personalSkillData;

  // 统计数据
  const categories = Array.from(new Set(personalSkillData.map(item => item.category)));
  const categoryLabels = {
    'product': '产品知识',
    'communication': '沟通技巧', 
    'sales': '销售技巧',
    'service': '服务技巧',
    'finance': '金融知识'
  };

  return (
    <div className={`bg-white rounded-lg shadow ${isLargeView ? 'p-8' : 'p-6'}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`font-medium text-gray-900 ${isLargeView ? 'text-xl' : 'text-lg'}`}>
            我的技能评估对比
          </h3>
          <p className="text-sm text-gray-500 mt-1">AI评分 vs 自我评估对比分析</p>
        </div>
      </div>

      {/* 技能类别筛选 */}
      {isLargeView && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedCategory === null 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部技能
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === category 
                  ? 'text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedCategory === category ? getCategoryColor(category) : undefined
              }}
            >
              {categoryLabels[category as keyof typeof categoryLabels]}
            </button>
          ))}
        </div>
      )}

      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{
              top: 20,
              right: 20,
              bottom: 20,
              left: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              type="number" 
              dataKey="aiScore" 
              name="AI评分"
              domain={[65, 100]}
              tickCount={8}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              type="number" 
              dataKey="selfScore" 
              name="自我评估"
              domain={[65, 100]}
              tickCount={8}
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Scatter
              name="技能评分"
              data={filteredData}
              fill="#8884d8"
            >
              {filteredData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getCategoryColor(entry.category)}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* 图例和统计信息 */}
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          {categories.map(category => (
            <div key={category} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getCategoryColor(category) }}
              ></div>
              <span className="text-gray-600">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </span>
            </div>
          ))}
        </div>

        {/* 统计摘要 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {personalSkillData.filter(d => Math.abs(d.selfScore - d.aiScore) <= 3).length}
            </div>
            <div className="text-xs text-gray-500">评估一致</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {personalSkillData.filter(d => d.selfScore > d.aiScore + 3).length}
            </div>
            <div className="text-xs text-gray-500">自评偏高</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {personalSkillData.filter(d => d.aiScore > d.selfScore + 3).length}
            </div>
            <div className="text-xs text-gray-500">AI评分更高</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {(personalSkillData.reduce((sum, d) => sum + Math.abs(d.selfScore - d.aiScore), 0) / personalSkillData.length).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">平均差值</div>
          </div>
        </div>
      </div>

      {/* 个人技能分析 */}
      {isLargeView && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">技能分析建议</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-800 mb-2">优势技能</h5>
              <ul className="space-y-1 text-gray-600">
                {personalSkillData
                  .filter(skill => skill.aiScore >= 85)
                  .slice(0, 3)
                  .map(skill => (
                    <li key={skill.skill}>• {skill.skill} ({skill.aiScore}分)</li>
                  ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 mb-2">待提升技能</h5>
              <ul className="space-y-1 text-gray-600">
                {personalSkillData
                  .filter(skill => skill.aiScore < 80)
                  .slice(0, 3)
                  .map(skill => (
                    <li key={skill.skill}>• {skill.skill} ({skill.aiScore}分)</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}