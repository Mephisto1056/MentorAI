'use client';

import { useState } from 'react';
import { PersonalDashboardData } from '@/types/dashboard';
import PersonalTrendChart from '@/components/PersonalTrendChart';
import PersonalSkillChart from '@/components/PersonalSkillChart';
import ChartModal from '@/components/ChartModal';

interface PersonalDashboardProps {
  data: PersonalDashboardData;
  activeSection: string;
  timeRange: string;
}

function PersonalDashboard({ data, activeSection, timeRange }: PersonalDashboardProps) {
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [modalChart, setModalChart] = useState<'trend' | 'skill' | null>(null);

  const openChartModal = (chartType: 'trend' | 'skill') => {
    setModalChart(chartType);
    setChartModalOpen(true);
  };

  const closeChartModal = () => {
    setChartModalOpen(false);
    setModalChart(null);
  };
  // 安全检查，确保数据存在
  if (!data || !data.personalStats) {
    return (
      <div className="personal-dashboard">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">个人数据面板</h2>
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
      {/* 个人核心指标 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white text-sm font-bold">
              AI
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              ↗ +3
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">AI对练任务</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{data.personalStats.myTasksAssigned}</p>
            <p className="text-xs text-gray-500">本月新增对练</p>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
              完成
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              ↗ +5%
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">对练完成率</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{data.personalStats.myCompletionRate}%</p>
            <p className="text-xs text-gray-500">较上月提升</p>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
              评分
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
              ↗ +2.1
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">AI对练评分</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">{data.personalStats.myAverageScore}</p>
            <p className="text-xs text-gray-500">AI智能评估分数</p>
          </div>
        </div>

        <div className="card-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xs font-bold">
              排名
            </div>
            <span className="text-sm font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
              #3
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">团队排名</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">第{data.personalStats.myRanking}名</p>
            <p className="text-xs text-gray-500">销售顾问排名</p>
          </div>
        </div>
      </div>

      {/* 学习进度概览 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI对练进度</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">当前等级</span>
                <span className="text-sm text-blue-600">{data.learningProgress.currentLevel}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                  style={{ width: `${(data.learningProgress.experiencePoints / data.learningProgress.nextLevelRequirement) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{data.learningProgress.experiencePoints} XP</span>
                <span>{data.learningProgress.nextLevelRequirement} XP</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              下一个目标: <span className="font-medium text-gray-900">{data.learningProgress.nextMilestone}</span>
            </div>
          </div>
        </div>

        <div className="card-glass p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">对练成就</h3>
          <div className="space-y-3">
            {data.personalGoals.achievements.map(achievement => (
              <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  成就
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{achievement.title}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                  <div className="text-xs text-gray-500">{achievement.earnedDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 个人AI对练图表 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          <PersonalTrendChart timeRange={timeRange} />
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
          <PersonalSkillChart />
          <button
            onClick={() => openChartModal('skill')}
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

  const renderLearningProgress = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">AI对练进度详情</h3>
        
        {/* 经验值和等级 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">{data.learningProgress.currentLevel}</h4>
              <p className="text-sm text-gray-600">当前等级</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{data.learningProgress.experiencePoints}</div>
              <p className="text-sm text-gray-600">经验值</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${(data.learningProgress.experiencePoints / data.learningProgress.nextLevelRequirement) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>当前: {data.learningProgress.experiencePoints} XP</span>
              <span>升级需要: {data.learningProgress.nextLevelRequirement} XP</span>
            </div>
          </div>
        </div>

        {/* 学习统计 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{data.learningProgress.completedCourses}</div>
            <div className="text-sm text-gray-600">已完成对练</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{data.recentSessions.sessions.length}</div>
            <div className="text-sm text-gray-600">最近对练</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{data.personalGoals.achievements.length}</div>
            <div className="text-sm text-gray-600">获得成就</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecentSessions = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">最近AI对练记录</h3>
        <div className="space-y-4">
          {data.recentSessions.sessions.map(session => (
            <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  session.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                }`}>
                  {session.status === 'completed' ? '完成' : '进行'}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{session.name}</div>
                  <div className="text-sm text-gray-600">{session.date} • {session.duration}分钟</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">{session.score}分</div>
                <div className="text-sm text-gray-500">评分</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">待完成AI对练</h3>
        <div className="space-y-3">
          {data.recentSessions.upcomingTasks.map(task => (
            <div key={task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  task.priority === 'high' ? 'bg-red-500' : 
                  task.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <div>
                  <div className="font-medium text-gray-900">{task.title}</div>
                  <div className="text-sm text-gray-600">截止日期: {task.dueDate}</div>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                task.priority === 'high' ? 'bg-red-100 text-red-700' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {task.priority === 'high' ? '高优先级' : 
                 task.priority === 'medium' ? '中优先级' : '低优先级'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSkillAnalysis = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">销售技能分析</h3>
        
        {/* 技能雷达图数据 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">销售技能评分</h4>
            <div className="space-y-4">
              {data.skillAnalysis.skillRadarData.map(skill => (
                <div key={skill.skill}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{skill.skill}</span>
                    <span className="text-sm text-gray-600">{skill.score}/{skill.maxScore}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                      style={{ width: `${(skill.score / skill.maxScore) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">优势销售技能</h4>
              <div className="flex flex-wrap gap-2">
                {data.skillAnalysis.strengths.map(strength => (
                  <span key={strength} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    {strength}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-3">需要提升的技能</h4>
              <div className="flex flex-wrap gap-2">
                {data.skillAnalysis.improvementAreas.map(area => (
                  <span key={area} className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalGoals = () => (
    <div className="space-y-6">
      <div className="card-glass p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">AI对练目标</h3>
        
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">本月对练目标进度</h4>
            <span className="text-sm text-gray-600">
              {data.personalGoals.progress}/{data.personalGoals.monthlyTarget} 次对练
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full"
              style={{ width: `${(data.personalGoals.progress / data.personalGoals.monthlyTarget) * 100}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            完成度: {Math.round((data.personalGoals.progress / data.personalGoals.monthlyTarget) * 100)}%
          </div>
        </div>

        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-4">对练成就</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.personalGoals.achievements.map(achievement => (
              <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  成就
                </div>
                <div>
                  <div className="font-medium text-gray-900">{achievement.title}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                  <div className="text-xs text-gray-500">获得时间: {achievement.earnedDate}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'learning-progress':
        return renderLearningProgress();
      case 'recent-sessions':
        return renderRecentSessions();
      case 'skill-analysis':
        return renderSkillAnalysis();
      case 'personal-goals':
        return renderPersonalGoals();
      case 'achievements':
        return renderPersonalGoals(); // 复用个人目标的成就部分
      case 'schedule':
        return (
          <div className="card-glass p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">AI对练计划</h3>
            <p className="text-gray-600">AI对练计划功能正在开发中...</p>
          </div>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="personal-dashboard">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">个人AI对练面板</h2>
        <p className="text-gray-600">查看您的AI对练进度和销售技能提升数据 • {timeRange}</p>
      </div>
      {renderContent()}

      {/* 图表放大模态框 */}
      <ChartModal
        isOpen={chartModalOpen}
        onClose={closeChartModal}
        title={modalChart === 'trend' ? '我的AI对练进步趋势' : '我的技能评估对比'}
      >
        {modalChart === 'trend' && (
          <PersonalTrendChart timeRange={timeRange} isLargeView={true} />
        )}
        {modalChart === 'skill' && (
          <PersonalSkillChart isLargeView={true} />
        )}
      </ChartModal>
    </div>
  );
}

export default PersonalDashboard;