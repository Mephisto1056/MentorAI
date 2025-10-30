'use client';

import { useState } from 'react';
import { UserLevel, NavSection, QuickAccessItem, FavoriteItem } from '@/types/dashboard';

interface SideNavigationProps {
  selectedLevel: UserLevel;
  onLevelChange: (level: UserLevel) => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// 导航配置
const navigationConfig = {
  personal: [
    { id: 'overview', label: '总览', icon: '■' },
    { id: 'recent-sessions', label: 'AI对练记录', icon: '●', count: 3 },
    { id: 'skill-analysis', label: '技能分析', icon: '▲' },
    { id: 'personal-goals', label: '对练目标', icon: '◆' }
  ],
  dealer: [
    { id: 'overview', label: '总览', icon: '■' },
    { id: 'team-performance', label: '团队表现', icon: '●' },
    { id: 'training-programs', label: 'AI对练项目', icon: '▲' },
    { id: 'customer-feedback', label: '客户反馈', icon: '◆', count: 8 }
  ],
  regional: [
    { id: 'overview', label: '总览', icon: '■' },
    { id: 'dealer-comparison', label: '门店对比', icon: '●' },
    { id: 'market-analysis', label: '效果分析', icon: '▲' },
    { id: 'strategic-insights', label: '战略洞察', icon: '◆' }
  ]
};

const quickAccessItems: QuickAccessItem[] = [
  { id: 'pending-tasks', icon: '!', label: '待处理任务', count: 5, action: () => {} },
  { id: 'export-report', icon: '↓', label: '导出报告', action: () => {} }
];

const favoriteItems: FavoriteItem[] = [
  { id: 'monthly-practice', label: '本月AI对练数据', url: '#monthly-practice' },
  { id: 'team-ranking', label: '团队排行榜', url: '#team-ranking' }
];

export default function SideNavigation({
  selectedLevel,
  onLevelChange,
  activeSection,
  onSectionChange,
  isCollapsed = false,
  onToggleCollapse
}: SideNavigationProps) {
  const currentNavSections = navigationConfig[selectedLevel];

  const levelOptions = [
    { value: 'personal', label: '● 个人', description: '个人AI对练数据' },
    { value: 'dealer', label: '■ 门店', description: '门店团队数据' },
    { value: 'regional', label: '▲ 区域', description: '区域管理数据' }
  ];

  return (
    <div className={`side-nav bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } h-screen fixed left-0 top-16 z-40 overflow-y-auto`}>
      
      {/* 折叠按钮 */}
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-lg">
            {isCollapsed ? '→' : '←'}
          </span>
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* 层级切换器 */}
          <div className="p-4 border-b border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              数据层级
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => onLevelChange(e.target.value as UserLevel)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {levelOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {levelOptions.find(opt => opt.value === selectedLevel)?.description}
            </p>
          </div>

          {/* 快速导航菜单 */}
          <nav className="p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">导航菜单</h4>
            <div className="space-y-1">
              {currentNavSections.map(section => (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3 text-base">{section.icon}</span>
                  <span className="flex-1 text-left">{section.label}</span>
                  {(section as any).count && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                      {(section as any).count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* 快速访问区域 */}
          <div className="p-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">快速访问</h4>
            <div className="space-y-2">
              {quickAccessItems.map(item => (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-3 text-base">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.count && (
                    <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-600 rounded-full">
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 收藏夹 */}
          <div className="p-4 border-t border-gray-100">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">收藏夹</h4>
            <div className="space-y-2">
              {favoriteItems.map(item => (
                <a
                  key={item.id}
                  href={item.url}
                  className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="mr-2">★</span>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* 添加收藏按钮 */}
          <div className="p-4 border-t border-gray-100">
            <button className="w-full flex items-center justify-center px-3 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
              <span className="mr-2">+</span>
              添加到收藏夹
            </button>
          </div>
        </>
      )}

      {/* 折叠状态下的简化导航 */}
      {isCollapsed && (
        <div className="p-2">
          {currentNavSections.map(section => (
            <button
              key={section.id}
              onClick={() => onSectionChange(section.id)}
              className={`w-full flex items-center justify-center p-3 mb-1 text-lg rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={section.label}
            >
              {section.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}