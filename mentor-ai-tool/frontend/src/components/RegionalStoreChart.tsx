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
  BarChart,
  Bar,
  Legend
} from 'recharts';

// 区域门店AI对练数据
const regionalStoreData = [
  { storeName: '上海浦东店', city: '上海', aiScore: 92, completionRate: 95, staff: 48, sessions: 1250, region: 'east' },
  { storeName: '北京朝阳店', city: '北京', aiScore: 89, completionRate: 92, staff: 52, sessions: 1180, region: 'north' },
  { storeName: '深圳南山店', city: '深圳', aiScore: 88, completionRate: 89, staff: 45, sessions: 1320, region: 'south' },
  { storeName: '广州天河店', city: '广州', aiScore: 85, completionRate: 87, staff: 42, sessions: 980, region: 'south' },
  { storeName: '杭州西湖店', city: '杭州', aiScore: 87, completionRate: 91, staff: 38, sessions: 1050, region: 'east' },
  { storeName: '成都锦江店', city: '成都', aiScore: 83, completionRate: 85, staff: 40, sessions: 890, region: 'west' },
  { storeName: '武汉江汉店', city: '武汉', aiScore: 86, completionRate: 88, staff: 44, sessions: 1120, region: 'central' },
  { storeName: '西安雁塔店', city: '西安', aiScore: 82, completionRate: 84, staff: 36, sessions: 820, region: 'west' },
  { storeName: '南京鼓楼店', city: '南京', aiScore: 88, completionRate: 90, staff: 41, sessions: 1080, region: 'east' },
  { storeName: '天津和平店', city: '天津', aiScore: 84, completionRate: 86, staff: 39, sessions: 950, region: 'north' },
  { storeName: '重庆渝中店', city: '重庆', aiScore: 81, completionRate: 83, staff: 37, sessions: 780, region: 'west' },
  { storeName: '青岛市南店', city: '青岛', aiScore: 85, completionRate: 87, staff: 35, sessions: 920, region: 'east' },
];

// 自定义Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{data.storeName}</p>
        <p className="text-sm text-blue-600">AI评分: {data.aiScore}分</p>
        <p className="text-sm text-green-600">完成率: {data.completionRate}%</p>
        <p className="text-sm text-gray-500">员工数: {data.staff}人</p>
        <p className="text-sm text-gray-500">对练次数: {data.sessions}次</p>
        <p className="text-xs text-gray-400 mt-1">
          城市: {data.city}
        </p>
      </div>
    );
  }
  return null;
};

// 根据区域确定颜色
const getRegionColor = (region: string) => {
  const colors = {
    'east': '#3B82F6', // 蓝色 - 华东
    'south': '#10B981', // 绿色 - 华南
    'north': '#F59E0B', // 黄色 - 华北
    'west': '#8B5CF6', // 紫色 - 西部
    'central': '#EF4444', // 红色 - 华中
  };
  return colors[region as keyof typeof colors] || '#6B7280';
};

// 根据员工数确定点的大小
const getStaffSize = (staff: number) => {
  return Math.max(60, Math.min(150, staff * 2));
};

interface RegionalStoreChartProps {
  isLargeView?: boolean;
}

export default function RegionalStoreChart({ 
  isLargeView = false 
}: RegionalStoreChartProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'scatter' | 'bar'>('scatter');

  const chartHeight = isLargeView ? 500 : 240;
  
  // 过滤数据
  const filteredData = selectedRegion 
    ? regionalStoreData.filter(item => item.region === selectedRegion)
    : regionalStoreData;

  // 统计数据
  const regions = Array.from(new Set(regionalStoreData.map(item => item.region)));
  const regionLabels = {
    'east': '华东',
    'south': '华南',
    'north': '华北',
    'west': '西部',
    'central': '华中'
  };

  const renderChart = () => {
    if (chartType === 'scatter') {
      return (
        <ScatterChart
          data={filteredData}
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
            domain={[75, 95]}
            tickCount={5}
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis 
            type="number" 
            dataKey="completionRate" 
            name="完成率"
            domain={[80, 100]}
            tickCount={5}
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          
          <Scatter 
            name="门店表现" 
            data={filteredData} 
            fill="#8884d8"
          >
            {filteredData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getRegionColor(entry.region)}
              />
            ))}
          </Scatter>
        </ScatterChart>
      );
    } else {
      return (
        <BarChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="storeName" 
            stroke="#6b7280"
            fontSize={10}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="aiScore" fill="#3B82F6" name="AI评分" />
          <Bar dataKey="completionRate" fill="#10B981" name="完成率" />
        </BarChart>
      );
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow ${isLargeView ? 'p-8' : 'p-6'}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`font-medium text-gray-900 ${isLargeView ? 'text-xl' : 'text-lg'}`}>
            区域门店AI对练表现
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {chartType === 'scatter' ? 'AI评分 vs 完成率对比（点大小表示员工数）' : '门店AI评分和完成率对比'}
          </p>
        </div>
        {isLargeView && (
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('scatter')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                chartType === 'scatter' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              散点图
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-xs font-medium rounded ${
                chartType === 'bar' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              柱状图
            </button>
          </div>
        )}
      </div>

      {/* 区域筛选 */}
      {isLargeView && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRegion(null)}
            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedRegion === null 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            全部区域
          </button>
          {regions.map(region => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedRegion === region 
                  ? 'text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={{
                backgroundColor: selectedRegion === region ? getRegionColor(region) : undefined
              }}
            >
              {regionLabels[region as keyof typeof regionLabels]}
            </button>
          ))}
        </div>
      )}

      <div style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* 图例和统计信息 */}
      <div className="mt-4 space-y-3">
        <div className="flex flex-wrap gap-4 text-sm">
          {regions.map(region => (
            <div key={region} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: getRegionColor(region) }}
              ></div>
              <span className="text-gray-600">
                {regionLabels[region as keyof typeof regionLabels]}
              </span>
            </div>
          ))}
          {chartType === 'scatter' && (
            <div className="flex items-center">
              <div className="text-xs text-gray-500 ml-4">点大小 = 员工数</div>
            </div>
          )}
        </div>

        {/* 统计摘要 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {regionalStoreData.filter(d => d.aiScore >= 90).length}
            </div>
            <div className="text-xs text-gray-500">优秀门店(≥90分)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {regionalStoreData.filter(d => d.completionRate >= 90).length}
            </div>
            <div className="text-xs text-gray-500">高完成率(≥90%)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {(regionalStoreData.reduce((sum, d) => sum + d.aiScore, 0) / regionalStoreData.length).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">平均AI评分</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {(regionalStoreData.reduce((sum, d) => sum + d.completionRate, 0) / regionalStoreData.length).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">平均完成率</div>
          </div>
        </div>
      </div>

      {/* 区域分析 */}
      {isLargeView && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">区域表现分析</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-800 mb-2">表现优秀门店</h5>
              <ul className="space-y-1 text-gray-600">
                {regionalStoreData
                  .filter(store => store.aiScore >= 88)
                  .slice(0, 3)
                  .map(store => (
                    <li key={store.storeName}>• {store.storeName} ({store.aiScore}分)</li>
                  ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 mb-2">需要提升门店</h5>
              <ul className="space-y-1 text-gray-600">
                {regionalStoreData
                  .filter(store => store.aiScore < 85)
                  .slice(0, 3)
                  .map(store => (
                    <li key={store.storeName}>• {store.storeName} ({store.aiScore}分)</li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}