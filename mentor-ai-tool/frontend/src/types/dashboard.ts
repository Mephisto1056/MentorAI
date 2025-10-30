// Dashboard 数据类型定义

export type UserLevel = 'personal' | 'dealer' | 'regional';
export type TimeRange = '本周' | '本月' | '本季度' | '本年';

// 基础数据类型
export interface BaseStats {
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'stable';
  description: string;
}

// 导航项目类型
export interface NavSection {
  id: string;
  label: string;
  icon: string;
  count?: number;
}

// 快速访问项目
export interface QuickAccessItem {
  id: string;
  icon: string;
  label: string;
  count?: number;
  action: () => void;
}

// 收藏夹项目
export interface FavoriteItem {
  id: string;
  label: string;
  url: string;
}

// 个人层级数据类型
export interface PersonalDashboardData {
  personalStats: {
    myTasksAssigned: number;
    myCompletionRate: number;
    myAverageScore: number;
    myRanking: number;
  };
  learningProgress: {
    currentLevel: string;
    experiencePoints: number;
    nextLevelRequirement: number;
    completedCourses: number;
    nextMilestone: string;
  };
  recentSessions: {
    sessions: PracticeSession[];
    upcomingTasks: Task[];
  };
  skillAnalysis: {
    strengths: string[];
    improvementAreas: string[];
    skillRadarData: SkillData[];
  };
  personalGoals: {
    monthlyTarget: number;
    progress: number;
    achievements: Achievement[];
  };
}

// 经销商层级数据类型
export interface DealerDashboardData {
  dealerStats: {
    totalSalesStaff: number;
    dealerCompletionRate: number;
    dealerAverageScore: number;
    dealerRanking: number;
  };
  teamPerformance: {
    topPerformers: Employee[];
    underPerformers: Employee[];
    teamTrends: TrendData[];
  };
  departmentAnalysis: {
    salesDept: DepartmentStats;
    serviceDept: DepartmentStats;
    managementDept: DepartmentStats;
  };
  trainingPrograms: {
    activePrograms: Program[];
    completionRates: ProgramStats[];
    upcomingTraining: Training[];
  };
  customerFeedback: {
    satisfactionScore: number;
    feedbackTrends: FeedbackData[];
    improvementActions: Action[];
  };
}

// 区域层级数据类型
export interface RegionalDashboardData {
  regionalStats: {
    totalDealers: number;
    regionalCompletionRate: number;
    regionalAverageScore: number;
    marketShare: number;
  };
  dealerComparison: {
    topDealers: Dealer[];
    performanceMatrix: DealerMatrix[];
    benchmarkAnalysis: BenchmarkData[];
  };
  marketAnalysis: {
    salesTrends: MarketTrend[];
    competitorAnalysis: CompetitorData[];
    marketOpportunities: Opportunity[];
  };
  resourceAllocation: {
    trainingBudget: BudgetData;
    staffDistribution: StaffData[];
    facilityUtilization: FacilityData[];
  };
  strategicInsights: {
    kpiDashboard: KPI[];
    predictiveAnalytics: Prediction[];
    actionRecommendations: Recommendation[];
  };
}

// 支持数据类型
export interface PracticeSession {
  id: string;
  name: string;
  date: string;
  score: number;
  status: 'completed' | 'in_progress' | 'pending';
  duration: number;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
}

export interface SkillData {
  skill: string;
  score: number;
  maxScore: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earnedDate: string;
  icon: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  score: number;
  sessions: number;
  trend: 'up' | 'down' | 'stable';
  avatar: string;
}

export interface DepartmentStats {
  name: string;
  totalStaff: number;
  averageScore: number;
  completionRate: number;
  trend: TrendData;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  participants: number;
  completionRate: number;
  startDate: string;
  endDate: string;
}

export interface ProgramStats {
  programId: string;
  programName: string;
  completionRate: number;
  averageScore: number;
}

export interface Training {
  id: string;
  title: string;
  date: string;
  instructor: string;
  participants: number;
}

export interface FeedbackData {
  date: string;
  score: number;
  comments: number;
  category: string;
}

export interface Action {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  dueDate: string;
}

export interface Dealer {
  id: string;
  name: string;
  location: string;
  score: number;
  staff: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
}

export interface DealerMatrix {
  dealerId: string;
  dealerName: string;
  performance: number;
  potential: number;
  category: 'star' | 'question_mark' | 'cash_cow' | 'dog';
}

export interface BenchmarkData {
  metric: string;
  ourValue: number;
  industryAverage: number;
  bestInClass: number;
}

export interface MarketTrend {
  period: string;
  sales: number;
  marketShare: number;
  growth: number;
}

export interface CompetitorData {
  competitor: string;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  potential: number;
  timeline: string;
  priority: 'high' | 'medium' | 'low';
}

export interface BudgetData {
  total: number;
  allocated: number;
  spent: number;
  remaining: number;
  categories: BudgetCategory[];
}

export interface BudgetCategory {
  name: string;
  allocated: number;
  spent: number;
}

export interface StaffData {
  department: string;
  count: number;
  utilization: number;
}

export interface FacilityData {
  facility: string;
  capacity: number;
  utilization: number;
  efficiency: number;
}

export interface KPI {
  name: string;
  value: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  status: 'good' | 'warning' | 'critical';
}

export interface Prediction {
  metric: string;
  currentValue: number;
  predictedValue: number;
  confidence: number;
  timeframe: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  priority: number;
}

export interface TrendData {
  period: string;
  value: number;
}