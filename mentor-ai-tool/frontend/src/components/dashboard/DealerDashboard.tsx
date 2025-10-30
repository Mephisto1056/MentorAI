'use client';

import { useState } from 'react';
import { DealerDashboardData } from '@/types/dashboard';
import TaskCompletionTrendChart from '@/components/TaskCompletionTrendChart';
import TeamScatterChart from '@/components/TeamScatterChart';
import ChartModal from '@/components/ChartModal';

interface DealerDashboardProps {
  data: DealerDashboardData;
  activeSection: string;
  timeRange: string;
}

function DealerDashboard({ data, activeSection, timeRange }: DealerDashboardProps) {
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [modalChart, setModalChart] = useState<'trend' | 'team' | null>(null);

  const openChartModal = (chartType: 'trend' | 'team') => {
    setModalChart(chartType);
    setChartModalOpen(true);
  };

  const closeChartModal = () => {
    setChartModalOpen(false);
    setModalChart(null);
  };
  // 安全检查，确保数据存在
  if (!data || !data.dealerStats) {
    return (
      <div className="dealer-dashboard">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">经销商数据面板</h2>
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
      {/* 经销商核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
              人员
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              ↗ +5
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">销售顾问总数</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{data.dealerStats.totalSalesStaff}</p>
            <p className="text-xs text-gray-500">参与AI对练人员</p>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
              完成
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              ↗ +3.2%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">AI对练完成率</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{data.dealerStats.dealerCompletionRate}%</p>
            <p className="text-xs text-gray-500">团队整体对练表现</p>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
              评分
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              ↗ +1.8
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">AI评分均值</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{data.dealerStats.dealerAverageScore}</p>
            <p className="text-xs text-gray-500">团队AI对练平均分</p>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
              排名
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
              #5
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">门店排名</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">第{data.dealerStats.dealerRanking}名</p>
            <p className="text-xs text-gray-500">区域AI对练排名</p>
          </div>
        </div>
      </div>

      {/* 团队表现概览 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI对练优秀员工</h3>
          <div className="space-y-3">
            {data.teamPerformance.topPerformers.slice(0, 3).map(employee => (
              <div key={employee.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {employee.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-600">{employee.position}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">{employee.score}分</div>
                  <div className="text-xs text-green-600">AI对练优秀</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">客户满意度</h3>
          <div className="text-center mb-4">
            <div className="text-3xl font-bold text-blue-600">{data.customerFeedback.satisfactionScore}</div>
            <div className="text-sm text-gray-600">平均评分 (满分5分)</div>
          </div>
          <div className="space-y-2">
            {data.customerFeedback.feedbackTrends.slice(-3).map((feedback, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{feedback.date}</span>
                <span className="font-medium text-gray-900">{feedback.score}分</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeamPerformance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">AI对练优秀员工</h3>
          <div className="space-y-4">
            {data.teamPerformance.topPerformers.map(employee => (
              <div key={employee.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-medium">
                    {employee.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-600">{employee.position}</div>
                    <div className="text-xs text-gray-500">{employee.sessions}次AI对练</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">{employee.score}分</div>
                  <div className={`text-xs ${
                    employee.trend === 'up' ? 'text-green-600' : 
                    employee.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {employee.trend === 'up' ? '↗ 上升' : 
                     employee.trend === 'down' ? '↘ 下降' : '→ 稳定'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">需要AI对练辅导的员工</h3>
          <div className="space-y-4">
            {data.teamPerformance.underPerformers.map(employee => (
              <div key={employee.id} className="flex items-center justify-between p-4 border border-orange-200 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-medium">
                    {employee.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{employee.name}</div>
                    <div className="text-sm text-gray-600">{employee.position}</div>
                    <div className="text-xs text-gray-500">{employee.sessions}次AI对练</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-orange-700">{employee.score}分</div>
                  <div className="text-xs text-orange-600">需要AI对练辅导</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">AI对练团队趋势</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.teamPerformance.teamTrends.map((trend, index) => (
            <div key={index} className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{trend.value}</div>
              <div className="text-sm text-gray-600">{trend.period}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI对练数据图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          <TaskCompletionTrendChart timeRange={timeRange} />
          <button
            onClick={() => openChartModal('trend')}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="放大查看"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
        </div>
        
        <div className="relative">
          <TeamScatterChart />
          <button
            onClick={() => openChartModal('team')}
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

  const renderDepartmentAnalysis = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">部门分析</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[data.departmentAnalysis.salesDept, data.departmentAnalysis.serviceDept, data.departmentAnalysis.managementDept].map(dept => (
            <div key={dept.name} className="p-6 border border-gray-200 rounded-lg">
              <h4 className="text-lg font-medium text-gray-900 mb-4">{dept.name}</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">员工总数</span>
                  <span className="font-medium text-gray-900">{dept.totalStaff}人</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">平均评分</span>
                  <span className="font-medium text-gray-900">{dept.averageScore}分</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">完成率</span>
                  <span className="font-medium text-gray-900">{dept.completionRate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${dept.completionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTrainingPrograms = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">活跃AI对练项目</h3>
        <div className="space-y-4">
          {data.trainingPrograms.activePrograms.map(program => (
            <div key={program.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{program.name}</h4>
                  <p className="text-sm text-gray-600">{program.description}</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                  {program.completionRate}% 完成
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>参与人数: {program.participants}人</span>
                <span>{program.startDate} - {program.endDate}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                  style={{ width: `${program.completionRate}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">即将开始的AI对练</h3>
        <div className="space-y-3">
          {data.trainingPrograms.upcomingTraining.map(training => (
            <div key={training.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <div className="font-medium text-gray-900">{training.title}</div>
                <div className="text-sm text-gray-600">AI导师: {training.instructor}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{training.date}</div>
                <div className="text-xs text-gray-600">{training.participants}人参与</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderCustomerFeedback = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">客户满意度分析</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">{data.customerFeedback.satisfactionScore}</div>
            <div className="text-gray-600 mb-4">平均满意度评分</div>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} className={`text-2xl ${
                  star <= Math.floor(data.customerFeedback.satisfactionScore) ? 'text-yellow-400' : 'text-gray-300'
                }`}>
                  ★
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">反馈趋势</h4>
            <div className="space-y-3">
              {data.customerFeedback.feedbackTrends.map((feedback, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{feedback.date}</div>
                    <div className="text-xs text-gray-600">{feedback.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">{feedback.score}分</div>
                    <div className="text-xs text-gray-600">{feedback.comments}条评论</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">改进行动计划</h3>
        <div className="space-y-4">
          {data.customerFeedback.improvementActions.map(action => (
            <div key={action.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">{action.title}</h4>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  action.priority === 'high' ? 'bg-red-100 text-red-700' :
                  action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {action.priority === 'high' ? '高优先级' : 
                   action.priority === 'medium' ? '中优先级' : '低优先级'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{action.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>负责人: {action.assignee}</span>
                <span>截止日期: {action.dueDate}</span>
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
      case 'team-performance':
        return renderTeamPerformance();
      case 'department-analysis':
        return renderDepartmentAnalysis();
      case 'training-programs':
        return renderTrainingPrograms();
      case 'customer-feedback':
        return renderCustomerFeedback();
      case 'staff-management':
        return (
          <div className="card-glass p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI对练员工管理</h3>
            <p className="text-gray-600">AI对练员工管理功能正在开发中...</p>
          </div>
        );
      case 'performance-reports':
        return (
          <div className="card-glass p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI对练绩效报告</h3>
            <p className="text-gray-600">AI对练绩效报告功能正在开发中...</p>
          </div>
        );
      case 'resource-planning':
        return (
          <div className="card-glass p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI对练资源规划</h3>
            <p className="text-gray-600">AI对练资源规划功能正在开发中...</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="dealer-dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">门店AI对练管理面板</h2>
        <p className="text-gray-600">管理团队AI对练表现和培训项目 • {timeRange}</p>
      </div>
      {renderContent()}

      {/* 图表放大模态框 */}
      <ChartModal
        isOpen={chartModalOpen}
        onClose={closeChartModal}
        title={modalChart === 'trend' ? '团队AI对练完成率趋势' : '团队成员AI对练表现'}
      >
        {modalChart === 'trend' && (
          <TaskCompletionTrendChart timeRange={timeRange} isLargeView={true} />
        )}
        {modalChart === 'team' && (
          <TeamScatterChart isLargeView={true} />
        )}
      </ChartModal>
    </div>
  );
}

export default DealerDashboard;