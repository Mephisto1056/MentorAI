'use client';

import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

// 个人AI对练数据
const generatePersonalData = (timeRange: string) => {
  const baseData = {
    '本周': [
      { period: '周一', score: 82, sessions: 3, improvement: 2, date: '2025-01-06' },
      { period: '周二', score: 85, sessions: 2, improvement: 3, date: '2025-01-07' },
      { period: '周三', score: 88, sessions: 4, improvement: 3, date: '2025-01-08' },
      { period: '周四', score: 86, sessions: 3, improvement: -2, date: '2025-01-09' },
      { period: '周五', score: 91, sessions: 2, improvement: 5, date: '2025-01-10' },
    ],
    '本月': [
      { period: '第1周', score: 78, sessions: 12, improvement: 0, date: '2025-01-01' },
      { period: '第2周', score: 83, sessions: 15, improvement: 5, date: '2025-01-08' },
      { period: '第3周', score: 87, sessions: 11, improvement: 4, date: '2025-01-15' },
      { period: '第4周', score: 89, sessions: 13, improvement: 2, date: '2025-01-22' },
      { period: '第5周', score: 92, sessions: 9, improvement: 3, date: '2025-01-29' },
    ],
    '本季度': [
      { period: '1月', score: 85, sessions: 50, improvement: 8, date: '2025-01-01' },
      { period: '2月', score: 88, sessions: 45, improvement: 3, date: '2025-02-01' },
      { period: '3月', score: 92, sessions: 52, improvement: 4, date: '2025-03-01' },
    ],
    '本年': [
      { period: 'Q1', score: 88, sessions: 147, improvement: 15, date: '2025-01-01' },
      { period: 'Q2', score: 91, sessions: 132, improvement: 3, date: '2025-04-01' },
      { period: 'Q3', score: 89, sessions: 156, improvement: -2, date: '2025-07-01' },
      { period: 'Q4', score: 93, sessions: 143, improvement: 4, date: '2025-10-01' },
    ]
  };
  
  return baseData[timeRange as keyof typeof baseData] || baseData['本月'];
};

// 自定义Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        <div className="space-y-1">
          <p className="text-sm text-blue-600">
            AI评分: <span className="font-semibold">{data.score}分</span>
          </p>
          <p className="text-sm text-green-600">
            对练次数: <span className="font-semibold">{data.sessions}</span> 次
          </p>
          <p className="text-sm text-gray-600">
            提升幅度: <span className="font-semibold">{data.improvement > 0 ? '+' : ''}{data.improvement}分</span>
          </p>
          <p className="text-xs text-gray-400 mt-2 pt-2 border-t">
            日期: {data.date}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

interface PersonalTrendChartProps {
  timeRange: string;
  isLargeView?: boolean;
}

export default function PersonalTrendChart({ 
  timeRange,
  isLargeView = false 
}: PersonalTrendChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  
  const data = generatePersonalData(timeRange);
  const chartHeight = isLargeView ? 400 : 240;
  
  // 计算个人趋势指标
  const currentScore = data[data.length - 1]?.score || 0;
  const previousScore = data[data.length - 2]?.score || 0;
  const trend = currentScore - previousScore;
  const averageScore = data.reduce((sum, item) => sum + item.score, 0) / data.length;
  const maxScore = Math.max(...data.map(item => item.score));
  const totalSessions = data.reduce((sum, item) => sum + item.sessions, 0);

  const renderChart = () => {
    if (chartType === 'area') {
      return (
        <AreaChart data={data}>
          <defs>
            <linearGradient id="personalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            domain={[70, 100]}
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            tickFormatter={(value) => `${value}分`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#10B981"
            strokeWidth={3}
            fill="url(#personalGradient)"
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#ffffff' }}
          />
        </AreaChart>
      );
    } else {
      return (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            domain={[70, 100]}
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            tickFormatter={(value) => `${value}分`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2, fill: '#ffffff' }}
          />
        </LineChart>
      );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow ${isLargeView ? 'p-8' : 'p-6'}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`font-medium text-gray-900 ${isLargeView ? 'text-xl' : 'text-lg'}`}>
            我的AI对练进步趋势
          </h3>
          <p className="text-sm text-gray-500 mt-1">显示{timeRange}的个人评分变化</p>
        </div>
        <div className="flex items-center space-x-2">
          {isLargeView && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  chartType === 'area' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                面积图
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  chartType === 'line' 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                线图
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* 个人趋势指标 */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {currentScore}分
          </div>
          <div className="text-xs text-gray-500">当前评分</div>
          <div className={`text-xs mt-1 ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {trend > 0 ? '+' : ''}{trend}分
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {averageScore.toFixed(1)}分
          </div>
          <div className="text-xs text-gray-500">平均评分</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {maxScore}分
          </div>
          <div className="text-xs text-gray-500">最高评分</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">
            {totalSessions}次
          </div>
          <div className="text-xs text-gray-500">总对练次数</div>
        </div>
      </div>

      {/* 个人分析 */}
      {isLargeView && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">个人表现分析</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-800 mb-2">进步亮点</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• 评分整体呈{trend > 0 ? '上升' : trend < 0 ? '下降' : '稳定'}趋势</li>
                <li>• 最高评分达到 {maxScore}分</li>
                <li>• 平均评分保持在 {averageScore.toFixed(1)}分</li>
                <li>• 累计完成 {totalSessions}次 AI对练</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 mb-2">提升建议</h5>
              <ul className="space-y-1 text-gray-600">
                {averageScore < 85 && <li>• 建议增加AI对练频次，提升熟练度</li>}
                {trend < 0 && <li>• 需要分析近期评分下降的原因</li>}
                <li>• 可重点练习评分较低的销售场景</li>
                <li>• 建议观看优秀案例，学习最佳实践</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}