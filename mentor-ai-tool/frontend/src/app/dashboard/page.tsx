'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserLevel, TimeRange } from '@/types/dashboard';
import SideNavigation from '@/components/dashboard/SideNavigation';
import DashboardContent from '@/components/dashboard/DashboardContent';

export default function Dashboard() {
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('本月');
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>('personal');
  const [activeSection, setActiveSection] = useState('overview');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLevelChange = (level: UserLevel) => {
    setSelectedLevel(level);
    setActiveSection('overview'); // 切换层级时重置到总览
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const toggleNavCollapse = () => {
    setIsNavCollapsed(!isNavCollapsed);
  };

  const handleTimeRangeChange = (timeRange: TimeRange) => {
    setSelectedTimeRange(timeRange);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">AI</span>
              </div>
              <div>
                <Link href="/" className="text-xl font-bold gradient-text hover:opacity-80 transition-opacity">
                  AI Mentor工具
                </Link>
                <span className="text-xs text-muted-foreground block">数据面板界面</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/task-generator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                任务生成
              </Link>
              <Link href="/practice-chat" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                学员对话
              </Link>
              <Link href="/mentor-evaluation" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                导师评估
              </Link>
              
              {/* 时间范围选择器 */}
              <select 
                value={selectedTimeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value as TimeRange)}
                className="text-sm bg-white border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="本周">本周</option>
                <option value="本月">本月</option>
                <option value="本季度">本季度</option>
                <option value="本年">本年</option>
              </select>

              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 左侧导航 */}
      <SideNavigation
        selectedLevel={selectedLevel}
        onLevelChange={handleLevelChange}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isCollapsed={isNavCollapsed}
        onToggleCollapse={toggleNavCollapse}
      />

      {/* 主内容区域 */}
      <main className={`pt-16 transition-all duration-300 ${
        isNavCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-6">
          <div className={`transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <DashboardContent
              selectedLevel={selectedLevel}
              activeSection={activeSection}
              timeRange={selectedTimeRange}
            />
          </div>
        </div>
      </main>

      {/* 响应式处理 - 移动端覆盖层 */}
      {!isNavCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleNavCollapse}
        />
      )}
    </div>
  );
}
