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
  Legend,
  Area,
  AreaChart
} from 'recharts';

// 模拟数据 - 任务完成率趋势
const generateTrendData = (timeRange: string) => {
  const baseData = {
    '本周': [
      { period: '周一', completionRate: 85, totalTasks: 45, completedTasks: 38, date: '2025-01-06' },
      { period: '周二', completionRate: 88, totalTasks: 52, completedTasks: 46, date: '2025-01-07' },
      { period: '周三', completionRate: 92, totalTasks: 48, completedTasks: 44, date: '2025-01-08' },
      { period: '周四', completionRate: 89, totalTasks: 55, completedTasks: 49, date: '2025-01-09' },
      { period: '周五', completionRate: 94, totalTasks: 42, completedTasks: 39, date: '2025-01-10' },
    ],
    '本月': [
      { period: '第1周', completionRate: 82, totalTasks: 156, completedTasks: 128, date: '2025-01-01' },
      { period: '第2周', completionRate: 87, totalTasks: 168, completedTasks: 146, date: '2025-01-08' },
      { period: '第3周', completionRate: 91, totalTasks: 145, completedTasks: 132, date: '2025-01-15' },
      { period: '第4周', completionRate: 89, totalTasks: 172, completedTasks: 153, date: '2025-01-22' },
      { period: '第5周', completionRate: 93, totalTasks: 134, completedTasks: 125, date: '2025-01-29' },
    ],
    '本季度': [
      { period: '1月', completionRate: 85, totalTasks: 641, completedTasks: 545, date: '2025-01-01' },
      { period: '2月', completionRate: 88, totalTasks: 578, completedTasks: 509, date: '2025-02-01' },
      { period: '3月', completionRate: 92, totalTasks: 623, completedTasks: 573, date: '2025-03-01' },
    ],
    '本年': [
      { period: 'Q1', completionRate: 88, totalTasks: 1842, completedTasks: 1621, date: '2025-01-01' },
      { period: 'Q2', completionRate: 91, totalTasks: 1756, completedTasks: 1598, date: '2025-04-01' },
      { period: 'Q3', completionRate: 89, totalTasks: 1834, completedTasks: 1632, date: '2025-07-01' },
      { period: 'Q4', completionRate: 93, totalTasks: 1689, completedTasks: 1571, date: '2025-10-01' },
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
            完成率: <span className="font-semibold">{data.completionRate}%</span>
          </p>
          <p className="text-sm text-green-600">
            已完成: <span className="font-semibold">{data.completedTasks}</span> 个任务
          </p>
          <p className="text-sm text-gray-600">
            总任务: <span className="font-semibold">{data.totalTasks}</span> 个
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

interface TaskCompletionTrendChartProps {
  timeRange: string;
  onViewLarge?: () => void;
  isLargeView?: boolean;
}

export default function TaskCompletionTrendChart({ 
  timeRange,
  onViewLarge, 
  isLargeView = false 
}: TaskCompletionTrendChartProps) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area');
  
  const data = generateTrendData(timeRange);
  const chartHeight = isLargeView ? 400 : 240;
  
  // 计算趋势指标
  const currentRate = data[data.length - 1]?.completionRate || 0;
  const previousRate = data[data.length - 2]?.completionRate || 0;
  const trend = currentRate - previousRate;
  const averageRate = data.reduce((sum, item) => sum + item.completionRate, 0) / data.length;
  const maxRate = Math.max(...data.map(item => item.completionRate));
  const minRate = Math.min(...data.map(item => item.completionRate));

  const renderChart = () => {
    if (chartType === 'area') {
      return (
        <AreaChart data={data}>
          <defs>
            <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
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
            domain={[Math.max(0, minRate - 5), Math.min(100, maxRate + 5)]}
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="completionRate"
            stroke="#3B82F6"
            strokeWidth={3}
            fill="url(#completionGradient)"
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
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
            domain={[Math.max(0, minRate - 5), Math.min(100, maxRate + 5)]}
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="completionRate"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#ffffff' }}
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
            任务完成率趋势
          </h3>
          <p className="text-sm text-gray-500 mt-1">显示{timeRange}的完成率变化</p>
        </div>
        <div className="flex items-center space-x-2">
          {isLargeView && (
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  chartType === 'area' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                面积图
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 text-xs font-medium rounded ${
                  chartType === 'line' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                线图
              </button>
            </div>
          )}
          {!isLargeView && (
            <button
              onClick={onViewLarge}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              查看大图
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* 趋势指标 */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {currentRate}%
          </div>
          <div className="text-xs text-gray-500">当前完成率</div>
          <div className={`text-xs mt-1 ${
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {averageRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500">平均完成率</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">
            {maxRate}%
          </div>
          <div className="text-xs text-gray-500">最高完成率</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-orange-600">
            {minRate}%
          </div>
          <div className="text-xs text-gray-500">最低完成率</div>
        </div>
      </div>

      {/* 趋势分析 */}
      {isLargeView && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">趋势分析</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-800 mb-2">表现亮点</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• 完成率整体呈{trend > 0 ? '上升' : trend < 0 ? '下降' : '稳定'}趋势</li>
                <li>• 最高完成率达到 {maxRate}%</li>
                <li>• 平均完成率保持在 {averageRate.toFixed(1)}% 以上</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 mb-2">改进建议</h5>
              <ul className="space-y-1 text-gray-600">
                {averageRate < 85 && <li>• 建议加强任务跟进和辅导支持</li>}
                {maxRate - minRate > 10 && <li>• 关注完成率波动较大的时期</li>}
                {trend < 0 && <li>• 需要分析近期完成率下降的原因</li>}
                <li>• 可考虑设置阶段性激励机制</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
