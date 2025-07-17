'use client';

import { useState } from 'react';
import Link from 'next/link';
import EvaluationDistributionChart from '@/components/EvaluationDistributionChart';
import TaskCompletionTrendChart from '@/components/TaskCompletionTrendChart';
import ChartModal from '@/components/ChartModal';

export default function Dashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('本月');
  const [selectedLevel, setSelectedLevel] = useState('个人');
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                AI Mentor工具
              </Link>
              <span className="ml-2 text-sm text-gray-500">后台面板界面</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/task-generator" className="text-sm text-gray-600 hover:text-blue-600">
                任务生成
              </Link>
              <Link href="/practice-chat" className="text-sm text-gray-600 hover:text-blue-600">
                学员对话
              </Link>
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* 页面标题和筛选器 */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">后台面板界面</h2>
            <div className="flex space-x-4">
              <select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="个人">个人</option>
                <option value="经销商">经销商</option>
                <option value="经销商集团">经销商集团</option>
                <option value="区域">区域</option>
              </select>
              <select 
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="本周">本周</option>
                <option value="本月">本月</option>
                <option value="本季度">本季度</option>
                <option value="本年">本年</option>
              </select>
            </div>
          </div>

          {/* 关键指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                title: '任务分配', 
                value: '156', 
                change: '+12', 
                changeType: 'increase',
                color: 'blue',
                description: '本月新增任务'
              },
              { 
                title: '完成率', 
                value: '92%', 
                change: '+5.3%', 
                changeType: 'increase',
                color: 'green',
                description: '较上月提升'
              },
              { 
                title: '平均评价度', 
                value: '85.2', 
                change: '+2.1', 
                changeType: 'increase',
                color: 'purple',
                description: 'AI+Mentor综合评分'
              },
              { 
                title: '活跃学员', 
                value: '48', 
                change: '-3', 
                changeType: 'decrease',
                color: 'orange',
                description: '本月活跃用户'
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                  </div>
                  <div className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.changeType === 'increase' ? '↗' : '↘'} {stat.change}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 主要图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 任务完成率趋势 */}
            <TaskCompletionTrendChart
              timeRange={selectedTimeRange}
            />

            {/* 评价度分布 */}
            <EvaluationDistributionChart />
          </div>

          {/* 详细数据表格和排行榜 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 学员排行榜 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">学员排行榜</h3>
              <div className="space-y-3">
                {[
                  { name: 'Amy', score: 92, sessions: 15, trend: 'up' },
                  { name: 'Andy', score: 88, sessions: 12, trend: 'up' },
                  { name: 'Bob', score: 85, sessions: 18, trend: 'down' },
                  { name: 'Carol', score: 82, sessions: 9, trend: 'up' },
                  { name: 'David', score: 79, sessions: 14, trend: 'stable' }
                ].map((student, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <span className="font-medium">{student.name}</span>
                        <div className="text-xs text-gray-500">{student.sessions}次练习</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{student.score}分</div>
                      <div className="text-xs">
                        {student.trend === 'up' && <span className="text-green-500">↗</span>}
                        {student.trend === 'down' && <span className="text-red-500">↘</span>}
                        {student.trend === 'stable' && <span className="text-gray-500">→</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 任务类型分析 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">任务类型分析</h3>
              <div className="space-y-4">
                {[
                  { task: '991-2产品介绍', count: 45, completion: 89 },
                  { task: '小米SU7竞品对比', count: 32, completion: 76 },
                  { task: '客户需求挖掘', count: 28, completion: 82 },
                  { task: '金融方案销售', count: 21, completion: 71 },
                  { task: '试驾邀约', count: 18, completion: 94 }
                ].map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.task}</span>
                      <span className="text-gray-500">{item.count}次 | {item.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${item.completion}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 区间变化监控 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">区间变化监控</h3>
              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-900">本周完成率</span>
                    <span className="text-green-600 font-bold">↗ +8.5%</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">相比上周显著提升</p>
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900">平均评分</span>
                    <span className="text-blue-600 font-bold">↗ +2.3</span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">持续稳定增长</p>
                </div>
                
                <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-yellow-900">活跃度</span>
                    <span className="text-yellow-600 font-bold">→ 持平</span>
                  </div>
                  <p className="text-xs text-yellow-700 mt-1">需要关注用户参与度</p>
                </div>
                
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-red-900">任务分配</span>
                    <span className="text-red-600 font-bold">↘ -5.2%</span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">需要增加任务投放</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI洞察报告 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">AI洞察报告 - {selectedTimeRange}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">主要发现</h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded">
                    <h5 className="font-medium text-blue-900">沟通技巧表现优秀</h5>
                    <p className="text-blue-700">85%的学员在客户沟通方式匹配上表现良好，特别是D型和I型客户的应对策略掌握较好。</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded">
                    <h5 className="font-medium text-green-900">产品知识扎实</h5>
                    <p className="text-green-700">保时捷产品知识平均得分92分，学员对车型配置和技术参数掌握充分。</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded">
                    <h5 className="font-medium text-yellow-900">竞品分析需加强</h5>
                    <p className="text-yellow-700">竞品对比环节平均得分仅78分，特别是对新能源竞品的了解不够深入。</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">改进建议</h4>
                <div className="space-y-3 text-sm">
                  <div className="p-3 bg-purple-50 rounded">
                    <h5 className="font-medium text-purple-900">加强竞品培训</h5>
                    <p className="text-purple-700">建议增加小米SU7、理想L9等新能源竞品的专项培训课程。</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded">
                    <h5 className="font-medium text-orange-900">深化需求挖掘</h5>
                    <p className="text-orange-700">客户需求挖掘技巧有待提升，建议加强SPIN销售法的实战练习。</p>
                  </div>
                  <div className="p-3 bg-red-50 rounded">
                    <h5 className="font-medium text-red-900">提高参与度</h5>
                    <p className="text-red-700">部分学员练习频次偏低，建议设置激励机制提高参与积极性。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 详细数据表格 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">详细数据表格</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">学员</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任务分配</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">完成率</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI评分</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor评分</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">综合评价</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后活跃</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    { name: 'Amy', assigned: 15, completion: 93, aiScore: 89, mentorScore: 95, overall: 92, lastActive: '2小时前' },
                    { name: 'Andy', assigned: 12, completion: 83, aiScore: 85, mentorScore: 91, overall: 88, lastActive: '5小时前' },
                    { name: 'Bob', assigned: 18, completion: 89, aiScore: 82, mentorScore: 88, overall: 85, lastActive: '1天前' },
                    { name: 'Carol', assigned: 9, completion: 78, aiScore: 80, mentorScore: 84, overall: 82, lastActive: '3小时前' },
                    { name: 'David', assigned: 14, completion: 71, aiScore: 76, mentorScore: 82, overall: 79, lastActive: '6小时前' }
                  ].map((row, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.assigned}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.completion}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.aiScore}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.mentorScore}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.overall >= 90 ? 'bg-green-100 text-green-800' :
                          row.overall >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {row.overall}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* 图表大图模态框 */}
      <ChartModal
        isOpen={isChartModalOpen}
        onClose={() => setIsChartModalOpen(false)}
        title="评价度分布图 - 详细视图"
      >
        <EvaluationDistributionChart 
          isLargeView={true}
        />
      </ChartModal>
    </div>
  );
}
