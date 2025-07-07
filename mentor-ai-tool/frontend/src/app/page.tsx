'use client';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AI Mentor工具</h1>
              <span className="ml-2 text-sm text-gray-500">销售培训平台</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">保时捷销售培训</span>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">M</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">欢迎使用AI Mentor工具</h2>
          <p className="text-lg text-gray-600 mb-8">为保时捷销售团队提供专业的AI驱动培训平台</p>
        </div>

        {/* 四个主要功能模块 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 任务生成界面 */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">任务生成界面</h3>
              <p className="text-gray-600 mb-6">
                通过下拉式选择栏进行排列组合，生成个性化的AI客户角色和销售场景
              </p>
              <div className="space-y-2 text-sm text-gray-500 mb-6">
                <div>• 多维度客户画像设定</div>
                <div>• 本品与竞品对比配置</div>
                <div>• 销售方法论选择</div>
                <div>• AI角色Prompt生成</div>
              </div>
              <a
                href="/task-generator"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                开始创建任务
              </a>
            </div>
          </div>

          {/* 学员对话界面 */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">学员对话界面</h3>
              <p className="text-gray-600 mb-6">
                与AI模拟客户进行实时对话练习，提升销售沟通技巧和话术水平
              </p>
              <div className="space-y-2 text-sm text-gray-500 mb-6">
                <div>• 实时AI客户模拟</div>
                <div>• 智能对话提示</div>
                <div>• 客户信息展示</div>
                <div>• 评估标准指导</div>
              </div>
              <a
                href="/practice-chat"
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                开始练习对话
              </a>
            </div>
          </div>

          {/* 后台面板界面 */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">后台面板界面</h3>
              <p className="text-gray-600 mb-6">
                全面监控任务分配、完成率、评价度等关键指标，提供数据分析洞察
              </p>
              <div className="space-y-2 text-sm text-gray-500 mb-6">
                <div>• 多维度数据监控</div>
                <div>• 完成率趋势分析</div>
                <div>• 学员排行榜</div>
                <div>• AI洞察报告</div>
              </div>
              <a
                href="/dashboard"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
              >
                查看数据面板
              </a>
            </div>
          </div>

          {/* 导师评估界面 */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍🏫</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mentor评估界面</h3>
              <p className="text-gray-600 mb-6">
                Mentor查看学员练习记录，结合AI评估进行专业指导和反馈
              </p>
              <div className="space-y-2 text-sm text-gray-500 mb-6">
                <div>• 待评估会话列表</div>
                <div>• AI评估结果参考</div>
                <div>• Mentor专业评价</div>
                <div>• 双重反馈机制</div>
              </div>
              <a
                href="/mentor-evaluation"
                className="inline-block bg-orange-600 text-white px-6 py-3 rounded-md hover:bg-orange-700 transition-colors"
              >
                开始评估学员
              </a>
            </div>
          </div>
        </div>

        {/* 系统特色 */}
        <div className="mt-16 bg-white rounded-lg shadow p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">系统特色</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🤖</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI驱动</h4>
              <p className="text-sm text-gray-600">基于先进AI技术，提供智能化的销售培训体验</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🎯</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">个性化定制</h4>
              <p className="text-sm text-gray-600">多维度客户画像，打造真实的销售场景</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">📈</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">数据驱动</h4>
              <p className="text-sm text-gray-600">全面的数据分析，科学评估培训效果</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl">🔄</span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">闭环培训</h4>
              <p className="text-sm text-gray-600">从任务生成到效果评估的完整培训闭环</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
