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

// 模拟数据 - AI评分 vs Mentor评分
const evaluationData = [
  { aiScore: 85, mentorScore: 88, student: '张三', count: 3 },
  { aiScore: 92, mentorScore: 89, student: '李四', count: 2 },
  { aiScore: 78, mentorScore: 82, student: '王五', count: 4 },
  { aiScore: 88, mentorScore: 91, student: '赵六', count: 1 },
  { aiScore: 76, mentorScore: 79, student: '钱七', count: 3 },
  { aiScore: 94, mentorScore: 92, student: '孙八', count: 2 },
  { aiScore: 82, mentorScore: 85, student: '周九', count: 5 },
  { aiScore: 90, mentorScore: 87, student: '吴十', count: 2 },
  { aiScore: 87, mentorScore: 90, student: '郑十一', count: 3 },
  { aiScore: 79, mentorScore: 83, student: '王十二', count: 4 },
  { aiScore: 91, mentorScore: 94, student: '李十三', count: 1 },
  { aiScore: 83, mentorScore: 86, student: '张十四', count: 3 },
  { aiScore: 89, mentorScore: 88, student: '陈十五', count: 2 },
  { aiScore: 77, mentorScore: 81, student: '刘十六', count: 4 },
  { aiScore: 93, mentorScore: 91, student: '黄十七', count: 2 },
];

// 自定义Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{data.student}</p>
        <p className="text-sm text-blue-600">AI评分: {data.aiScore}</p>
        <p className="text-sm text-green-600">Mentor评分: {data.mentorScore}</p>
        <p className="text-sm text-gray-500">评价次数: {data.count}</p>
        <p className="text-xs text-gray-400 mt-1">
          差值: {Math.abs(data.mentorScore - data.aiScore)} 分
        </p>
      </div>
    );
  }
  return null;
};

// 根据评分差异确定颜色
const getPointColor = (aiScore: number, mentorScore: number) => {
  const diff = Math.abs(mentorScore - aiScore);
  if (diff <= 2) return '#10B981'; // 绿色 - 高度一致
  if (diff <= 5) return '#F59E0B'; // 黄色 - 中等一致
  return '#EF4444'; // 红色 - 差异较大
};

interface EvaluationDistributionChartProps {
  onViewLarge?: () => void;
  isLargeView?: boolean;
}

export default function EvaluationDistributionChart({ 
  onViewLarge, 
  isLargeView = false 
}: EvaluationDistributionChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  const chartHeight = isLargeView ? 500 : 240;

  return (
    <div className={`bg-white rounded-lg shadow ${isLargeView ? 'p-8' : 'p-6'}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`font-medium text-gray-900 ${isLargeView ? 'text-xl' : 'text-lg'}`}>
            评价度分布图
          </h3>
          <p className="text-sm text-gray-500 mt-1">AI评分 vs Mentor评分对比分析</p>
        </div>
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
              domain={[70, 100]}
              tickCount={7}
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              type="number" 
              dataKey="mentorScore" 
              name="Mentor评分"
              domain={[70, 100]}
              tickCount={7}
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* 理想线 - AI评分 = Mentor评分 */}
            <line
              x1="70"
              y1="70"
              x2="100"
              y2="100"
              stroke="#d1d5db"
              strokeWidth={2}
              strokeDasharray="5,5"
            />
            
            <Scatter 
              name="评分对比" 
              data={evaluationData} 
              fill="#8884d8"
            >
              {evaluationData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getPointColor(entry.aiScore, entry.mentorScore)}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* 图例和统计信息 */}
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">高度一致 (差值≤2分)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-gray-600">中等一致 (差值3-5分)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600">差异较大 (差值&gt;5分)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-0.5 bg-gray-400 mr-2" style={{ borderTop: '2px dashed #d1d5db' }}></div>
            <span className="text-gray-600">理想一致线</span>
          </div>
        </div>

        {/* 统计摘要 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {evaluationData.filter(d => Math.abs(d.mentorScore - d.aiScore) <= 2).length}
            </div>
            <div className="text-xs text-gray-500">高度一致</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {evaluationData.filter(d => {
                const diff = Math.abs(d.mentorScore - d.aiScore);
                return diff > 2 && diff <= 5;
              }).length}
            </div>
            <div className="text-xs text-gray-500">中等一致</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {evaluationData.filter(d => Math.abs(d.mentorScore - d.aiScore) > 5).length}
            </div>
            <div className="text-xs text-gray-500">差异较大</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {(evaluationData.reduce((sum, d) => sum + Math.abs(d.mentorScore - d.aiScore), 0) / evaluationData.length).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">平均差值</div>
          </div>
        </div>
      </div>
    </div>
  );
}
