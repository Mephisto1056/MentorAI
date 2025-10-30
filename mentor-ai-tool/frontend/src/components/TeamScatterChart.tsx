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

// 团队成员AI对练数据
const teamMemberData = [
  { name: 'Amy Chen', aiScore: 92, mentorScore: 89, sessions: 18, department: 'sales', experience: 3 },
  { name: 'Bob Wang', aiScore: 88, mentorScore: 91, sessions: 15, department: 'sales', experience: 2 },
  { name: 'Carol Li', aiScore: 85, mentorScore: 87, sessions: 12, department: 'sales', experience: 1 },
  { name: 'David Zhang', aiScore: 75, mentorScore: 78, sessions: 8, department: 'sales', experience: 1 },
  { name: 'Eva Liu', aiScore: 82, mentorScore: 85, sessions: 10, department: 'sales', experience: 2 },
  { name: 'Frank Wu', aiScore: 90, mentorScore: 88, sessions: 16, department: 'sales', experience: 4 },
  { name: 'Grace Zhou', aiScore: 87, mentorScore: 90, sessions: 14, department: 'sales', experience: 3 },
  { name: 'Henry Xu', aiScore: 79, mentorScore: 82, sessions: 11, department: 'sales', experience: 1 },
  { name: 'Ivy Yang', aiScore: 94, mentorScore: 92, sessions: 20, department: 'sales', experience: 5 },
  { name: 'Jack Ma', aiScore: 83, mentorScore: 86, sessions: 13, department: 'sales', experience: 2 },
  { name: 'Kate Lin', aiScore: 89, mentorScore: 87, sessions: 17, department: 'service', experience: 3 },
  { name: 'Leo Chen', aiScore: 86, mentorScore: 89, sessions: 15, department: 'service', experience: 4 },
  { name: 'Mia Wang', aiScore: 91, mentorScore: 93, sessions: 19, department: 'service', experience: 5 },
  { name: 'Nick Liu', aiScore: 84, mentorScore: 87, sessions: 12, department: 'service', experience: 2 },
];

// 自定义Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-sm text-blue-600">AI评分: {data.aiScore}分</p>
        <p className="text-sm text-green-600">Mentor评分: {data.mentorScore}分</p>
        <p className="text-sm text-gray-500">对练次数: {data.sessions}次</p>
        <p className="text-sm text-gray-500">工作经验: {data.experience}年</p>
        <p className="text-xs text-gray-400 mt-1">
          部门: {data.department === 'sales' ? '销售部' : '服务部'}
        </p>
      </div>
    );
  }
  return null;
};

// 根据部门确定颜色
const getDepartmentColor = (department: string) => {
  const colors = {
    'sales': '#3B82F6', // 蓝色 - 销售部
    'service': '#10B981', // 绿色 - 服务部
    'management': '#F59E0B', // 黄色 - 管理部
  };
  return colors[department as keyof typeof colors] || '#6B7280';
};

// 根据工作经验确定点的大小
const getExperienceSize = (experience: number) => {
  return Math.max(40, Math.min(120, experience * 20 + 40));
};

interface TeamScatterChartProps {
  isLargeView?: boolean;
}

export default function TeamScatterChart({ 
  isLargeView = false 
}: TeamScatterChartProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);

  const chartHeight = isLargeView ? 500 : 240;
  
  // 过滤数据
  const filteredData = selectedDepartment 
    ? teamMemberData.filter(item => item.department === selectedDepartment)
    : teamMemberData;

  // 统计数据
  const departments = Array.from(new Set(teamMemberData.map(item => item.department)));
  const departmentLabels = {
    'sales': '销售部',
    'service': '服务部',
    'management': '管理部'
  };

  return (
    <div className={`bg-white rounded-lg shadow ${isLargeView ? 'p-8' : 'p-6'}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`font-medium text-gray-900 ${isLargeView ? 'text-xl' : 'text-lg'}`}>
            团队成员AI对练表现
          </h3>
          <p className="text-sm text-gray-500 mt-1">AI评分 vs Mentor评分对比（点大小表示工作经验）</p>
        </div>
      </div>

      {/* 部门筛选 */}
      {isLargeView && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDepartment(null)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedDepartment === null 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部成员
          </button>
          {departments.map(department => (
            <button
              key={department}
              onClick={() => setSelectedDepartment(department)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedDepartment === department 
                  ? 'text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedDepartment === department ? getDepartmentColor(department) : undefined
              }}
            >
              {departmentLabels[department as keyof typeof departmentLabels]}
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
            
            <Scatter 
              name="团队成员" 
              data={filteredData} 
              fill="#8884d8"
            >
              {filteredData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getDepartmentColor(entry.department)}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* 图例和统计信息 */}
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          {departments.map(department => (
            <div key={department} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getDepartmentColor(department) }}
              ></div>
              <span className="text-gray-600">
                {departmentLabels[department as keyof typeof departmentLabels]}
              </span>
            </div>
          ))}
          <div className="flex items-center">
            <div className="text-xs text-gray-500 ml-4">点大小 = 工作经验</div>
          </div>
        </div>

        {/* 统计摘要 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {teamMemberData.filter(d => Math.abs(d.mentorScore - d.aiScore) <= 3).length}
            </div>
            <div className="text-xs text-gray-500">评分一致</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {teamMemberData.filter(d => d.aiScore >= 90).length}
            </div>
            <div className="text-xs text-gray-500">AI高分(≥90)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {teamMemberData.filter(d => d.aiScore < 80).length}
            </div>
            <div className="text-xs text-gray-500">需要提升(&lt;80)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {(teamMemberData.reduce((sum, d) => sum + d.aiScore, 0) / teamMemberData.length).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">平均AI评分</div>
          </div>
        </div>
      </div>

      {/* 团队分析 */}
      {isLargeView && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">团队表现分析</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-800 mb-2">优秀成员</h5>
              <ul className="space-y-1 text-gray-600">
                {teamMemberData
                  .filter(member => member.aiScore >= 90)
                  .slice(0, 3)
                  .map(member => (
                    <li key={member.name}>• {member.name} ({member.aiScore}分)</li>
                  ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 mb-2">需要关注</h5>
              <ul className="space-y-1 text-gray-600">
                {teamMemberData
                  .filter(member => member.aiScore < 80)
                  .slice(0, 3)
                  .map(member => (
                    <li key={member.name}>• {member.name} ({member.aiScore}分)</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}