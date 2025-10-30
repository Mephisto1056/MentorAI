
'use client';

import { useState } from 'react';
import { RegionalDashboardData } from '@/types/dashboard';
import RegionalStoreChart from '@/components/RegionalStoreChart';
import ChinaMapChart from '@/components/ChinaMapChart';
import ChartModal from '@/components/ChartModal';

interface RegionalDashboardProps {
  data: RegionalDashboardData;
  activeSection: string;
  timeRange: string;
}

function RegionalDashboard({ data, activeSection, timeRange }: RegionalDashboardProps) {
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [modalChart, setModalChart] = useState<'store' | 'map' | null>(null);

  const openChartModal = (chartType: 'store' | 'map') => {
    setModalChart(chartType);
    setChartModalOpen(true);
  };

  const closeChartModal = () => {
    setChartModalOpen(false);
    setModalChart(null);
  };
  // 安全检查，确保数据存在
  if (!data || !data.regionalStats) {
    return (
      <div className="regional-dashboard">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">区域数据面板</h2>
          <p className="text-gray-600">数据加载中... • {timeRange}</p>
        </div>
        <div className="card-glass p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 区域核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
              门店
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              ↗ +2
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">门店总数</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{data.regionalStats.totalDealers}</p>
            <p className="text-xs text-gray-500">区域AI对练覆盖门店</p>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
              完成
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              ↗ +4.1%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">区域AI对练完成率</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{data.regionalStats.regionalCompletionRate}%</p>
            <p className="text-xs text-gray-500">整体AI对练完成度</p>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
              评分
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              ↗ +2.3
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">区域AI评分均值</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{data.regionalStats.regionalAverageScore}</p>
            <p className="text-xs text-gray-500">AI对练综合评分</p>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
              份额
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              ↗ +0.6%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">市场份额</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{data.regionalStats.marketShare}%</p>
            <p className="text-xs text-gray-500">区域市场占有率</p>
          </div>
        </div>
      </div>

      {/* 关键洞察 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI对练优秀门店</h3>
          <div className="space-y-3">
            {data.dealerComparison.topDealers.slice(0, 3).map((dealer, index) => (
              <div key={dealer.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                    'bg-gradient-to-r from-orange-400 to-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{dealer.name}</div>
                    <div className="text-sm text-gray-600">{dealer.location} • {dealer.staff}人</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{dealer.score}分</div>
                  <div className="text-xs text-green-600">
                    {dealer.trend === 'up' ? '↗ 上升' : dealer.trend === 'down' ? '↘ 下降' : '→ 稳定'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">关键KPI</h3>
          <div className="space-y-4">
            {data.strategicInsights.kpiDashboard.slice(0, 4).map(kpi => (
              <div key={kpi.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    kpi.status === 'good' ? 'bg-green-500' :
                    kpi.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-700">{kpi.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{kpi.value}</div>
                  <div className="text-xs text-gray-500">目标: {kpi.target}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 区域AI对练数据图表 */}
      <div className="space-y-6">
        <div className="relative">
          <RegionalStoreChart />
          <button
            onClick={() => openChartModal('store')}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="放大查看"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        </div>
        
        <div className="relative">
          <ChinaMapChart />
          <button
            onClick={() => openChartModal('map')}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="放大查看"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  const renderDealerComparison = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">门店AI对练排行榜</h3>
        <div className="space-y-4">
          {data.dealerComparison.topDealers.map((dealer, index) => (
            <div key={dealer.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{dealer.name}</div>
                  <div className="text-sm text-gray-600">{dealer.location}</div>
                  <div className="text-xs text-gray-500">{dealer.staff}名销售顾问 • AI对练{Math.floor(dealer.revenue / 100000)}次</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">{dealer.score}分</div>
                <div className={`text-xs ${
                  dealer.trend === 'up' ? 'text-green-600' : 
                  dealer.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {dealer.trend === 'up' ? '↗ 上升趋势' : 
                   dealer.trend === 'down' ? '↘ 下降趋势' : '→ 保持稳定'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">绩效矩阵分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.dealerComparison.performanceMatrix.map(dealer => (
            <div key={dealer.dealerId} className={`p-4 rounded-lg border-2 ${
              dealer.category === 'star' ? 'border-green-300 bg-green-50' :
              dealer.category === 'question_mark' ? 'border-yellow-300 bg-yellow-50' :
              dealer.category === 'cash_cow' ? 'border-blue-300 bg-blue-50' :
              'border-red-300 bg-red-50'
            }`}>
              <div className="text-center">
                <div className="font-medium text-gray-900 mb-2">{dealer.dealerName}</div>
                <div className="text-sm text-gray-600 mb-3">
                  {dealer.category === 'star' ? '★ 明星门店' :
                   dealer.category === 'question_mark' ? '? 待提升' :
                   dealer.category === 'cash_cow' ? '稳定门店' : '需关注'}
                </div>
                <div className="text-xs text-gray-500">
                  绩效: {dealer.performance} | 潜力: {dealer.potential}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">行业基准对比</h3>
        <div className="space-y-4">
          {data.dealerComparison.benchmarkAnalysis.map(benchmark => (
            <div key={benchmark.metric} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">{benchmark.metric}</h4>
                <div className="text-sm text-gray-600">
                  我们 vs 行业平均 vs 最佳实践
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{benchmark.ourValue}</div>
                  <div className="text-xs text-gray-600">我们的表现</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-bold text-gray-600">{benchmark.industryAverage}</div>
                  <div className="text-xs text-gray-600">行业平均</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{benchmark.bestInClass}</div>
                  <div className="text-xs text-gray-600">最佳实践</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMarketAnalysis = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">AI对练效果趋势分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {data.marketAnalysis.salesTrends.map(trend => (
            <div key={trend.period} className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{trend.sales}</div>
              <div className="text-sm text-gray-600">{trend.period}</div>
              <div className="text-xs text-gray-500">
                对练次数: {trend.marketShare}k | 提升: {trend.growth}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">竞争对手分析</h3>
        <div className="space-y-4">
          {data.marketAnalysis.competitorAnalysis.map(competitor => (
            <div key={competitor.competitor} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">{competitor.competitor}</h4>
                  <div className="text-sm text-gray-600">市场份额: {competitor.marketShare}%</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-green-700 mb-2">优势</h5>
                  <div className="space-y-1">
                    {competitor.strengths.map(strength => (
                      <div key={strength} className="text-sm text-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {strength}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-red-700 mb-2">劣势</h5>
                  <div className="space-y-1">
                    {competitor.weaknesses.map(weakness => (
                      <div key={weakness} className="text-sm text-gray-600 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        {weakness}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">市场机会</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.marketAnalysis.marketOpportunities.map(opportunity => (
            <div key={opportunity.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{opportunity.title}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  opportunity.priority === 'high' ? 'bg-red-100 text-red-700' :
                  opportunity.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {opportunity.priority === 'high' ? '高优先级' : 
                   opportunity.priority === 'medium' ? '中优先级' : '低优先级'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{opportunity.description}</p>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">潜力: {opportunity.potential}%</span>
                <span className="text-gray-600">时间线: {opportunity.timeline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResourceAllocation = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">AI对练预算分配</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-blue-600">¥{(data.resourceAllocation.trainingBudget.total / 10000).toFixed(0)}万</div>
              <div className="text-sm text-gray-600">总预算</div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">已分配</span>
                <span className="font-medium">¥{(data.resourceAllocation.trainingBudget.allocated / 10000).toFixed(0)}万</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">已使用</span>
                <span className="font-medium">¥{(data.resourceAllocation.trainingBudget.spent / 10000).toFixed(0)}万</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">剩余</span>
                <span className="font-medium text-green-600">¥{(data.resourceAllocation.trainingBudget.remaining / 10000).toFixed(0)}万</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-4">AI对练分类预算</h4>
            <div className="space-y-3">
              {data.resourceAllocation.trainingBudget.categories.map(category => (
                <div key={category.name} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    <span className="text-sm text-gray-600">
                      {Math.round((category.spent / category.allocated) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                      style={{ width: `${(category.spent / category.allocated) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>已用: ¥{(category.spent / 10000).toFixed(0)}万</span>
                    <span>预算: ¥{(category.allocated / 10000).toFixed(0)}万</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">AI对练人员分布</h3>
          <div className="space-y-4">
            {data.resourceAllocation.staffDistribution.map(staff => (
              <div key={staff.department} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">{staff.department}</h4>
                  <span className="text-sm text-gray-600">{staff.count}人</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">利用率</span>
                  <span className="text-sm font-medium">{staff.utilization}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    style={{ width: `${staff.utilization}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">AI对练设施利用率</h3>
          <div className="space-y-4">
            {data.resourceAllocation.facilityUtilization.map(facility => (
              <div key={facility.facility} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">{facility.facility}</h4>
                  <span className="text-sm text-gray-600">容量: {facility.capacity}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">{facility.utilization}%</div>
                    <div className="text-xs text-gray-600">利用率</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">{facility.efficiency}%</div>
                    <div className="text-xs text-gray-600">效率</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStrategicInsights = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">AI对练KPI仪表板</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.strategicInsights.kpiDashboard.map(kpi => (
            <div key={kpi.name} className={`p-4 rounded-lg border-2 ${
              kpi.status === 'good' ? 'border-green-300 bg-green-50' :
              kpi.status === 'warning' ? 'border-yellow-300 bg-yellow-50' :
              'border-red-300 bg-red-50'
            }`}>
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  kpi.status === 'good' ? 'text-green-600' :
                  kpi.status === 'warning' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {kpi.value}
                </div>
                <div className="text-sm font-medium text-gray-900 mb-1">{kpi.name}</div>
                <div className="text-xs text-gray-600">目标: {kpi.target}</div>
                <div className={`text-xs mt-1 ${
                  kpi.trend === 'up' ? 'text-green-600' :
                  kpi.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {kpi.trend === 'up' ? '↗ 上升' : 
                   kpi.trend === 'down' ? '↘ 下降' : '→ 稳定'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">AI对练预测性分析</h3>
        <div className="space-y-4">
          {data.strategicInsights.predictiveAnalytics.map(prediction => (
            <div key={prediction.metric} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{prediction.metric}</h4>
                <span className="text-sm text-gray-600">置信度: {prediction.confidence}%</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-600">{prediction.currentValue}</div>
                  <div className="text-xs text-gray-600">当前值</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-lg font-bold text-green-600">{prediction.predictedValue}</div>
                  <div className="text-xs text-gray-600">预测值</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-900">{prediction.timeframe}</div>
                  <div className="text-xs text-gray-600">时间框架</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">AI对练优化建议</h3>
        <div className="space-y-4">
          {data.strategicInsights.actionRecommendations.map(recommendation => (
            <div key={recommendation.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    recommendation.impact === 'high' ? 'bg-red-100 text-red-700' :
                    recommendation.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {recommendation.impact === 'high' ? '高影响' : 
                     recommendation.impact === 'medium' ? '中影响' : '低影响'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    recommendation.effort === 'high' ? 'bg-red-100 text-red-700' :
                    recommendation.effort === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {recommendation.effort === 'high' ? '高投入' : 
                     recommendation.effort === 'medium' ? '中投入' : '低投入'}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">优先级: #{recommendation.priority}</span>
                <button className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors">
                  查看详情
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'dealer-comparison':
        return renderDealerComparison();
      case 'market-analysis':
        return renderMarketAnalysis();
      case 'resource-allocation':
        return renderResourceAllocation();
      case 'strategic-insights':
        return renderStrategicInsights();
      case 'regional-trends':
        return (
          <div className="card-glass p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI对练区域趋势</h3>
            <p className="text-gray-600">AI对练区域趋势功能正在开发中...</p>
          </div>
        );
      case 'competitive-intel':
        return (
          <div className="card-glass p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI对练竞争分析</h3>
            <p className="text-gray-600">AI对练竞争分析功能正在开发中...</p>
          </div>
        );
      case 'expansion-planning':
        return (
          <div className="card-glass p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI对练扩张规划</h3>
            <p className="text-gray-600">AI对练扩张规划功能正在开发中...</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="regional-dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">区域AI对练管理面板</h2>
        <p className="text-gray-600">监控区域AI对练效果和战略洞察 • {timeRange}</p>
      </div>
      {renderContent()}

      {/* 图表放大模态框 */}
      <ChartModal
        isOpen={chartModalOpen}
        onClose={closeChartModal}
        title={modalChart === 'store' ? '区域门店AI对练表现' : '全国AI对练分布图'}
      >
        {modalChart === 'store' && (
          <RegionalStoreChart isLargeView={true} />
        )}
        {modalChart === 'map' && (
          <ChinaMapChart isLargeView={true} />
        )}
      </ChartModal>
    </div>
  );
}

export default RegionalDashboard;