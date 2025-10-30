'use client';

import { useState, useEffect } from 'react';
import { UserLevel, PersonalDashboardData, DealerDashboardData, RegionalDashboardData } from '@/types/dashboard';
import PersonalDashboard from './PersonalDashboard';
import DealerDashboard from './DealerDashboard';
import RegionalDashboard from './RegionalDashboard';

interface DashboardContentProps {
  selectedLevel: UserLevel;
  activeSection: string;
  timeRange: string;
}

export default function DashboardContent({
  selectedLevel,
  activeSection,
  timeRange
}: DashboardContentProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    setLoading(true);
    try {
      const mockData = getMockData(selectedLevel);
      setTimeout(() => {
        setData(mockData);
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
      setData(null);
    }
  }, [selectedLevel, timeRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">加载数据中...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg">
        <div className="text-center">
          <div className="text-gray-500 mb-2">数据加载失败</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    try {
      switch (selectedLevel) {
        case 'personal':
          return <PersonalDashboard data={data} activeSection={activeSection} timeRange={timeRange} />;
        case 'dealer':
          return <DealerDashboard data={data} activeSection={activeSection} timeRange={timeRange} />;
        case 'regional':
          return <RegionalDashboard data={data} activeSection={activeSection} timeRange={timeRange} />;
        default:
          return (
            <div className="bg-white rounded-lg p-6">
              <div className="text-gray-500">未知的数据层级: {selectedLevel}</div>
            </div>
          );
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div className="bg-white rounded-lg p-6">
          <div className="text-red-500">渲染错误，请刷新页面重试</div>
        </div>
      );
    }
  };

  return (
    <div className="dashboard-content">
      {renderContent()}
    </div>
  );
}

// 模拟数据生成函数
function getMockData(level: UserLevel) {
  switch (level) {
    case 'personal':
      return {
        personalStats: {
          myTasksAssigned: 15,
          myCompletionRate: 92,
          myAverageScore: 85.2,
          myRanking: 3
        },
        learningProgress: {
          currentLevel: '中级销售顾问',
          experiencePoints: 2850,
          nextLevelRequirement: 3500,
          completedCourses: 12,
          nextMilestone: '高级销售顾问认证'
        },
        recentSessions: {
          sessions: [
            { id: '1', name: 'AI客户：年轻家庭购车需求', date: '2024-01-15', score: 88, status: 'completed', duration: 25 },
            { id: '2', name: 'AI客户：商务人士换车咨询', date: '2024-01-14', score: 92, status: 'completed', duration: 30 },
            { id: '3', name: 'AI客户：首次购车价格敏感', date: '2024-01-13', score: 85, status: 'completed', duration: 20 }
          ],
          upcomingTasks: [
            { id: '1', title: 'AI对练：豪华车型销售技巧', dueDate: '2024-01-20', priority: 'high', status: 'pending' },
            { id: '2', title: 'AI对练：异议处理专项训练', dueDate: '2024-01-22', priority: 'medium', status: 'pending' }
          ]
        },
        skillAnalysis: {
          strengths: ['车型配置介绍', '客户需求挖掘', '试驾引导'],
          improvementAreas: ['价格谈判', '金融方案推荐', '售后服务介绍'],
          skillRadarData: [
            { skill: '车型配置介绍', score: 92, maxScore: 100 },
            { skill: '客户需求挖掘', score: 88, maxScore: 100 },
            { skill: '试驾引导', score: 85, maxScore: 100 },
            { skill: '价格谈判', score: 75, maxScore: 100 },
            { skill: '金融方案推荐', score: 78, maxScore: 100 },
            { skill: '售后服务介绍', score: 72, maxScore: 100 }
          ]
        },
        personalGoals: {
          monthlyTarget: 20,
          progress: 15,
          achievements: [
            { id: '1', title: 'AI对练连续7天', description: '保持AI对练习惯', earnedDate: '2024-01-10', icon: '连续' },
            { id: '2', title: '车型配置专家', description: 'AI车型知识测试满分', earnedDate: '2024-01-08', icon: '专家' }
          ]
        }
      } as PersonalDashboardData;

    case 'dealer':
      return {
        dealerStats: {
          totalSalesStaff: 48,
          dealerCompletionRate: 89,
          dealerAverageScore: 82.5,
          dealerRanking: 5
        },
        teamPerformance: {
          topPerformers: [
            { id: '1', name: 'Amy Chen', position: '高级销售顾问', score: 95, sessions: 18, trend: 'up', avatar: 'A' },
            { id: '2', name: 'Bob Wang', position: '销售顾问', score: 92, sessions: 15, trend: 'up', avatar: 'B' },
            { id: '3', name: 'Carol Li', position: '销售顾问', score: 88, sessions: 12, trend: 'stable', avatar: 'C' }
          ],
          underPerformers: [
            { id: '4', name: 'David Zhang', position: '初级销售顾问', score: 68, sessions: 8, trend: 'down', avatar: 'D' },
            { id: '5', name: 'Eva Liu', position: '销售顾问', score: 72, sessions: 10, trend: 'down', avatar: 'E' }
          ],
          teamTrends: [
            { period: '第1周', value: 85 },
            { period: '第2周', value: 87 },
            { period: '第3周', value: 89 },
            { period: '第4周', value: 91 }
          ]
        },
        departmentAnalysis: {
          salesDept: { name: '销售部', totalStaff: 32, averageScore: 84, completionRate: 91, trend: { period: '本月', value: 84 } },
          serviceDept: { name: '服务部', totalStaff: 12, averageScore: 88, completionRate: 95, trend: { period: '本月', value: 88 } },
          managementDept: { name: '管理部', totalStaff: 4, averageScore: 92, completionRate: 100, trend: { period: '本月', value: 92 } }
        },
        trainingPrograms: {
          activePrograms: [
            { id: '1', name: '新能源车型AI对练', description: '2024款新能源车型AI销售对练', participants: 25, completionRate: 78, startDate: '2024-01-01', endDate: '2024-01-31' },
            { id: '2', name: 'AI客户异议处理', description: 'AI模拟客户异议处理技巧', participants: 18, completionRate: 85, startDate: '2024-01-15', endDate: '2024-02-15' }
          ],
          completionRates: [
            { programId: '1', programName: '新能源车型AI对练', completionRate: 78, averageScore: 82 },
            { programId: '2', programName: 'AI客户异议处理', completionRate: 85, averageScore: 88 }
          ],
          upcomingTraining: [
            { id: '1', title: 'AI豪华车销售对练', date: '2024-01-25', instructor: 'AI导师系统', participants: 30 },
            { id: '2', title: 'AI金融方案推荐', date: '2024-01-28', instructor: 'AI专家系统', participants: 20 }
          ]
        },
        customerFeedback: {
          satisfactionScore: 4.2,
          feedbackTrends: [
            { date: '2024-01-01', score: 4.0, comments: 25, category: '销售服务' },
            { date: '2024-01-08', score: 4.1, comments: 32, category: '销售服务' },
            { date: '2024-01-15', score: 4.2, comments: 28, category: '销售服务' }
          ],
          improvementActions: [
            { id: '1', title: '提升响应速度', description: '客户咨询响应时间优化', priority: 'high', assignee: '客服主管', dueDate: '2024-01-30' },
            { id: '2', title: '完善售后服务', description: '售后服务流程改进', priority: 'medium', assignee: '服务经理', dueDate: '2024-02-15' }
          ]
        }
      } as DealerDashboardData;

    case 'regional':
      return {
        regionalStats: {
          totalDealers: 25,
          regionalCompletionRate: 87,
          regionalAverageScore: 83.8,
          marketShare: 15.2
        },
        dealerComparison: {
          topDealers: [
            { id: '1', name: '上海浦东店', location: '上海', score: 95, staff: 48, revenue: 2500000, trend: 'up' },
            { id: '2', name: '北京朝阳店', location: '北京', score: 92, staff: 52, revenue: 2800000, trend: 'up' },
            { id: '3', name: '深圳南山店', location: '深圳', score: 89, staff: 45, revenue: 2200000, trend: 'stable' }
          ],
          performanceMatrix: [
            { dealerId: '1', dealerName: '上海浦东店', performance: 95, potential: 88, category: 'star' },
            { dealerId: '2', dealerName: '北京朝阳店', performance: 92, potential: 92, category: 'star' },
            { dealerId: '3', dealerName: '深圳南山店', performance: 89, potential: 85, category: 'cash_cow' }
          ],
          benchmarkAnalysis: [
            { metric: '客户满意度', ourValue: 4.2, industryAverage: 3.8, bestInClass: 4.5 },
            { metric: '销售转化率', ourValue: 18.5, industryAverage: 15.2, bestInClass: 22.1 },
            { metric: '员工培训完成率', ourValue: 87, industryAverage: 75, bestInClass: 95 }
          ]
        },
        marketAnalysis: {
          salesTrends: [
            { period: 'Q1', sales: 1250, marketShare: 14.8, growth: 8.5 },
            { period: 'Q2', sales: 1380, marketShare: 15.1, growth: 10.4 },
            { period: 'Q3', sales: 1420, marketShare: 15.2, growth: 2.9 },
            { period: 'Q4', sales: 1580, marketShare: 15.8, growth: 11.3 }
          ],
          competitorAnalysis: [
            { competitor: '奔驰', marketShare: 22.5, strengths: ['品牌影响力', '产品线丰富'], weaknesses: ['价格偏高', '维护成本'] },
            { competitor: '宝马', marketShare: 20.8, strengths: ['运动性能', '科技配置'], weaknesses: ['后排空间', '燃油经济性'] },
            { competitor: '奥迪', marketShare: 18.2, strengths: ['内饰豪华', 'quattro技术'], weaknesses: ['品牌年轻化', '创新不足'] }
          ],
          marketOpportunities: [
            { id: '1', title: '新能源市场', description: '电动车市场快速增长', potential: 85, timeline: '6个月', priority: 'high' },
            { id: '2', title: '二三线城市', description: '下沉市场潜力巨大', potential: 72, timeline: '12个月', priority: 'medium' }
          ]
        },
        resourceAllocation: {
          trainingBudget: {
            total: 5000000,
            allocated: 4200000,
            spent: 3100000,
            remaining: 1100000,
            categories: [
              { name: '产品培训', allocated: 1500000, spent: 1200000 },
              { name: '销售技能', allocated: 1800000, spent: 1300000 },
              { name: '管理培训', allocated: 900000, spent: 600000 }
            ]
          },
          staffDistribution: [
            { department: '销售部', count: 680, utilization: 85 },
            { department: '服务部', count: 220, utilization: 92 },
            { department: '管理部', count: 85, utilization: 78 }
          ],
          facilityUtilization: [
            { facility: '培训中心', capacity: 200, utilization: 75, efficiency: 88 },
            { facility: '展厅', capacity: 150, utilization: 82, efficiency: 91 },
            { facility: '服务中心', capacity: 100, utilization: 95, efficiency: 93 }
          ]
        },
        strategicInsights: {
          kpiDashboard: [
            { name: '销售目标达成率', value: 108, target: 100, trend: 'up', status: 'good' },
            { name: '客户满意度', value: 4.2, target: 4.0, trend: 'up', status: 'good' },
            { name: '员工培训完成率', value: 87, target: 90, trend: 'up', status: 'warning' },
            { name: '市场份额', value: 15.2, target: 16.0, trend: 'stable', status: 'warning' }
          ],
          predictiveAnalytics: [
            { metric: '下季度销量', currentValue: 1580, predictedValue: 1720, confidence: 85, timeframe: 'Q1 2024' },
            { metric: '客户满意度', currentValue: 4.2, predictedValue: 4.3, confidence: 78, timeframe: '3个月' },
            { metric: '市场份额', currentValue: 15.2, predictedValue: 15.8, confidence: 72, timeframe: '6个月' }
          ],
          actionRecommendations: [
            { id: '1', title: '加强新能源AI对练', description: '针对电动车销售场景增加AI对练频次', impact: 'high', effort: 'medium', priority: 1 },
            { id: '2', title: '优化AI客户模型', description: '改进AI客户角色和对话逻辑', impact: 'high', effort: 'high', priority: 2 },
            { id: '3', title: '扩展AI对练场景', description: '增加更多销售场景的AI对练模式', impact: 'medium', effort: 'low', priority: 3 }
          ]
        }
      } as RegionalDashboardData;

    default:
      return null;
  }
}