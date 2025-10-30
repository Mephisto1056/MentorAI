'use client';

import { useState } from 'react';

// 中国地图SVG路径数据（主要省份）
const chinaProvinces = [
  { 
    name: '北京', 
    path: 'M420,140 L435,135 L445,145 L440,155 L430,160 L415,155 Z', 
    region: 'north', 
    score: 89, 
    stores: 3,
    centerX: 430,
    centerY: 150
  },
  { 
    name: '上海', 
    path: 'M500,220 L510,215 L515,225 L510,235 L500,230 Z', 
    region: 'east', 
    score: 92, 
    stores: 4,
    centerX: 508,
    centerY: 225
  },
  { 
    name: '广东', 
    path: 'M380,320 L420,315 L450,330 L445,350 L420,360 L390,355 L370,345 L375,330 Z', 
    region: 'south', 
    score: 88, 
    stores: 5,
    centerX: 410,
    centerY: 340
  },
  { 
    name: '浙江', 
    path: 'M480,210 L500,205 L505,220 L495,235 L480,230 L475,215 Z', 
    region: 'east', 
    score: 87, 
    stores: 2,
    centerX: 490,
    centerY: 220
  },
  { 
    name: '江苏', 
    path: 'M460,180 L485,175 L495,190 L490,205 L470,210 L455,195 Z', 
    region: 'east', 
    score: 88, 
    stores: 3,
    centerX: 475,
    centerY: 190
  },
  { 
    name: '四川', 
    path: 'M280,240 L330,235 L340,260 L325,285 L295,290 L270,275 L275,250 Z', 
    region: 'west', 
    score: 83, 
    stores: 2,
    centerX: 305,
    centerY: 260
  },
  { 
    name: '湖北', 
    path: 'M360,220 L405,215 L415,240 L405,260 L380,265 L355,250 L350,235 Z', 
    region: 'central', 
    score: 86, 
    stores: 2,
    centerX: 385,
    centerY: 240
  },
  { 
    name: '陕西', 
    path: 'M320,180 L365,175 L370,205 L360,230 L335,235 L315,220 L310,195 Z', 
    region: 'west', 
    score: 82, 
    stores: 1,
    centerX: 340,
    centerY: 205
  },
  { 
    name: '山东', 
    path: 'M420,160 L470,155 L480,180 L475,200 L450,205 L415,185 Z', 
    region: 'east', 
    score: 85, 
    stores: 2,
    centerX: 445,
    centerY: 180
  },
  { 
    name: '河南', 
    path: 'M380,180 L425,175 L435,200 L425,220 L395,225 L370,210 L365,190 Z', 
    region: 'central', 
    score: 84, 
    stores: 1,
    centerX: 400,
    centerY: 200
  },
  { 
    name: '湖南', 
    path: 'M350,250 L395,245 L405,270 L395,290 L370,295 L345,280 L340,265 Z', 
    region: 'central', 
    score: 86, 
    stores: 3,
    centerX: 375,
    centerY: 270
  },
  { 
    name: '江西', 
    path: 'M430,240 L465,235 L470,260 L460,280 L435,285 L425,265 Z', 
    region: 'east', 
    score: 85, 
    stores: 2,
    centerX: 450,
    centerY: 260
  },
  { 
    name: '福建', 
    path: 'M470,280 L495,275 L500,300 L490,320 L470,315 L465,295 Z', 
    region: 'east', 
    score: 87, 
    stores: 2,
    centerX: 485,
    centerY: 295
  },
  { 
    name: '安徽', 
    path: 'M440,200 L475,195 L480,220 L470,240 L445,245 L435,225 Z', 
    region: 'east', 
    score: 83, 
    stores: 1,
    centerX: 460,
    centerY: 220
  },
  { 
    name: '重庆', 
    path: 'M320,260 L340,255 L345,270 L335,280 L320,275 Z', 
    region: 'west', 
    score: 84, 
    stores: 2,
    centerX: 335,
    centerY: 270
  }
];

// 区域数据汇总
const regionData = [
  { region: 'east', name: '华东', totalStores: 11, avgScore: 88.4, color: '#3B82F6' },
  { region: 'south', name: '华南', totalStores: 5, avgScore: 88.0, color: '#10B981' },
  { region: 'north', name: '华北', totalStores: 3, avgScore: 86.5, color: '#F59E0B' },
  { region: 'west', name: '西部', totalStores: 3, avgScore: 82.5, color: '#8B5CF6' },
  { region: 'central', name: '华中', totalStores: 3, avgScore: 85.0, color: '#EF4444' },
];

// 根据评分获取颜色强度
const getScoreColor = (score: number, baseColor: string) => {
  const intensity = (score - 80) / 15; // 80-95分映射到0-1
  const alpha = Math.max(0.3, Math.min(1, intensity));
  
  // 将hex颜色转换为rgba
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface ChinaMapChartProps {
  isLargeView?: boolean;
}

export default function ChinaMapChart({ 
  isLargeView = false 
}: ChinaMapChartProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const mapWidth = isLargeView ? 600 : 400;
  const mapHeight = isLargeView ? 450 : 300;

  return (
    <div className={`bg-white rounded-lg shadow ${isLargeView ? 'p-8' : 'p-6'}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className={`font-medium text-gray-900 ${isLargeView ? 'text-xl' : 'text-lg'}`}>
            全国AI对练分布图
          </h3>
          <p className="text-sm text-gray-500 mt-1">各省份门店AI对练评分分布</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* 地图 */}
        <div className="flex-1 relative">
          <div 
            className="relative w-full border border-gray-200 rounded-lg overflow-hidden"
            style={{ 
              height: mapHeight,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 700'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23f0f9ff;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23e0f2fe;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1000' height='700' fill='url(%23bg)'/%3E%3C!-- 中国地图轮廓 --%3E%3Cpath d='M200,200 Q300,150 400,180 Q500,120 600,140 Q700,160 800,200 Q850,250 820,300 Q800,400 750,500 Q700,580 600,600 Q500,620 400,600 Q300,580 250,500 Q200,400 180,300 Q190,250 200,200 Z' fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-dasharray='5,5'/%3E%3C!-- 省份边界线 --%3E%3Cpath d='M300,250 Q350,230 400,250 Q450,270 500,260 Q520,280 500,300 Q480,320 450,310 Q400,325 350,310 Q320,290 300,250 Z' fill='none' stroke='%23e2e8f0' stroke-width='1'/%3E%3Cpath d='M520,200 Q570,180 620,200 Q650,220 640,250 Q630,280 600,270 Q570,260 540,270 Q520,250 520,200 Z' fill='none' stroke='%23e2e8f0' stroke-width='1'/%3E%3Cpath d='M350,350 Q400,330 450,350 Q480,370 470,400 Q460,430 430,420 Q400,410 370,420 Q350,400 350,350 Z' fill='none' stroke='%23e2e8f0' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* 数据点覆盖层 */}
            {chinaProvinces.map((province) => {
              const regionInfo = regionData.find(r => r.region === province.region);
              const isSelected = selectedRegion === province.region;
              const isHovered = hoveredProvince === province.name;
              
              // 计算在容器中的相对位置 (百分比)
              const leftPercent = (province.centerX / 600) * 100;
              const topPercent = (province.centerY / 450) * 100;
              
              return (
                <div
                  key={province.name}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 ${
                    isHovered ? 'z-20 scale-110' : 'z-10'
                  }`}
                  style={{
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                  }}
                  onMouseEnter={() => setHoveredProvince(province.name)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  onClick={() => setSelectedRegion(
                    selectedRegion === province.region ? null : province.region
                  )}
                >
                  {/* 数据卡片 */}
                  <div
                    className={`bg-white rounded-lg shadow-lg border-2 p-2 min-w-[80px] text-center transition-all duration-200 ${
                      selectedRegion && selectedRegion !== province.region
                        ? 'opacity-50 border-gray-200'
                        : `border-2 ${isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`
                    } ${isHovered ? 'shadow-xl scale-105' : 'hover:shadow-md'}`}
                    style={{
                      borderColor: isSelected ? regionInfo?.color : undefined,
                      backgroundColor: isSelected ? `${regionInfo?.color}10` : undefined
                    }}
                  >
                    <div className="text-xs font-medium text-gray-900 mb-1">{province.name}</div>
                    <div className="text-lg font-bold" style={{ color: regionInfo?.color }}>
                      {province.score}
                    </div>
                    <div className="text-xs text-gray-500">分</div>
                    <div className="text-xs text-gray-400 mt-1">{province.stores}店</div>
                    
                    {/* 区域标识点 */}
                    <div 
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                      style={{ backgroundColor: regionInfo?.color }}
                    ></div>
                  </div>
                  
                  {/* 悬浮详细信息 */}
                  {isHovered && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-30">
                      <div className="font-medium">{province.name}</div>
                      <div>评分: {province.score}分 | 门店: {province.stores}家</div>
                      <div>区域: {regionInfo?.name}</div>
                      {/* 小箭头 */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 区域统计 */}
        <div className="lg:w-80">
          <h4 className="font-medium text-gray-900 mb-4">区域统计</h4>
          <div className="space-y-3">
            {regionData.map((region) => (
              <div
                key={region.region}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedRegion === region.region
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedRegion(
                  selectedRegion === region.region ? null : region.region
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: region.color }}
                    ></div>
                    <span className="font-medium text-gray-900">{region.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{region.totalStores}家门店</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">平均评分</span>
                  <span className="font-semibold text-gray-900">{region.avgScore}分</span>
                </div>
              </div>
            ))}
          </div>

          {/* 图例 */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-gray-800 mb-2">评分图例</h5>
            <div className="space-y-1 text-xs">
              <div className="flex items-center">
                <div className="w-4 h-3 bg-blue-600 mr-2 rounded"></div>
                <span>90-95分 (优秀)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-3 bg-blue-400 mr-2 rounded"></div>
                <span>85-89分 (良好)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-3 bg-blue-200 mr-2 rounded"></div>
                <span>80-84分 (一般)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 全国统计摘要 */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {regionData.reduce((sum, r) => sum + r.totalStores, 0)}
          </div>
          <div className="text-xs text-gray-500">全国门店总数</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {(regionData.reduce((sum, r) => sum + r.avgScore * r.totalStores, 0) / 
              regionData.reduce((sum, r) => sum + r.totalStores, 0)).toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">全国平均评分</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {regionData.find(r => r.avgScore === Math.max(...regionData.map(r => r.avgScore)))?.name}
          </div>
          <div className="text-xs text-gray-500">最佳区域</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {chinaProvinces.filter(p => p.score >= 90).length}
          </div>
          <div className="text-xs text-gray-500">优秀省份数</div>
        </div>
      </div>

      {/* 区域分析 */}
      {isLargeView && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">区域表现分析</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-800 mb-2">优势区域</h5>
              <ul className="space-y-1 text-gray-600">
                {regionData
                  .sort((a, b) => b.avgScore - a.avgScore)
                  .slice(0, 3)
                  .map(region => (
                    <li key={region.region}>• {region.name}: {region.avgScore}分</li>
                  ))}
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-800 mb-2">发展建议</h5>
              <ul className="space-y-1 text-gray-600">
                <li>• 加强西部地区AI对练培训投入</li>
                <li>• 推广华东地区成功经验</li>
                <li>• 建立区域间交流学习机制</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
