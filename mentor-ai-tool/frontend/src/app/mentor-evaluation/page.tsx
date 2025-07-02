'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PendingSession {
  _id: string;
  sessionName: string;
  studentId: {
    username: string;
    profile: { name: string };
  };
  taskTemplateId?: {
    name: string;
    description: string;
  };
  submittedAt: string;
  duration: number;
  aiEvaluation?: {
    overallScore: number;
    dimensionScores: any[];
  };
}

interface SessionDetail {
  sessionId: string;
  sessionName: string;
  submittedAt: string;
  duration: number;
  taskConfig: any;
  customerProfile: any;
  conversation: any[];
  aiEvaluation: any;
  student: {
    username: string;
    profile: { name: string };
  };
}

export default function MentorEvaluation() {
  const [pendingSessions, setPendingSessions] = useState<PendingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 评估表单状态
  const [overallScore, setOverallScore] = useState<number>(80);
  const [feedback, setFeedback] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'conversation' | 'ai-evaluation'>('conversation');

  useEffect(() => {
    fetchPendingSessions();
  }, []);

  const fetchPendingSessions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/evaluations/pending');
      
      if (response.ok) {
        const result = await response.json();
        setPendingSessions(result.data || []);
      } else {
        setError('获取待评估会话失败');
      }
    } catch (err) {
      console.error('Fetch pending sessions error:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionDetail = async (sessionId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/evaluation`);
      
      if (response.ok) {
        const result = await response.json();
        setSelectedSession(result.data);
        setActiveTab('conversation');
        // 如果有AI评估，设置初始分数为AI评分
        if (result.data.aiEvaluation?.overallScore) {
          setOverallScore(result.data.aiEvaluation.overallScore);
        }
      } else {
        setError('获取会话详情失败');
      }
    } catch (err) {
      console.error('Fetch session detail error:', err);
      setError('网络错误，请稍后重试');
    }
  };

  const submitEvaluation = async () => {
    if (!selectedSession || !feedback.trim()) {
      alert('请填写评估反馈');
      return;
    }

    setEvaluating(true);
    try {
      const response = await fetch(`http://localhost:5000/api/evaluations/${selectedSession.sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          overallScore,
          feedback: feedback.trim()
        })
      });

      if (response.ok) {
        alert('评估提交成功！');
        // 刷新待评估列表
        await fetchPendingSessions();
        // 清空选中的会话
        setSelectedSession(null);
        setFeedback('');
        setOverallScore(80);
      } else {
        const errorData = await response.json();
        alert('提交失败: ' + (errorData.error || '未知错误'));
      }
    } catch (err) {
      console.error('Submit evaluation error:', err);
      alert('网络错误，请稍后重试');
    } finally {
      setEvaluating(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '中等';
    if (score >= 60) return '及格';
    return '不及格';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载待评估会话...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-blue-600">
                AI导师工具
              </Link>
              <span className="ml-2 text-sm text-gray-500">导师评估</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">
                数据面板
              </Link>
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">M</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">导师评估中心</h1>
            <div className="text-sm text-gray-600">
              待评估: {pendingSessions.length} 个会话
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 待评估列表 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">待评估会话</h3>
                </div>
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {pendingSessions.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      暂无待评估的会话
                    </div>
                  ) : (
                    pendingSessions.map((session) => (
                      <div
                        key={session._id}
                        onClick={() => fetchSessionDetail(session._id)}
                        className={`p-4 cursor-pointer hover:bg-gray-50 ${
                          selectedSession?.sessionId === session._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {session.sessionName}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              学员: {session.studentId.profile.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              提交: {new Date(session.submittedAt).toLocaleDateString('zh-CN')}
                            </p>
                            <p className="text-xs text-gray-500">
                              时长: {session.duration}分钟
                            </p>
                          </div>
                          {session.aiEvaluation && (
                            <div className="text-right">
                              <div className={`text-sm font-bold ${getScoreColor(session.aiEvaluation.overallScore)}`}>
                                {session.aiEvaluation.overallScore}
                              </div>
                              <div className="text-xs text-gray-500">AI评分</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 会话详情和评估 */}
            <div className="lg:col-span-2">
              {selectedSession ? (
                <div className="space-y-6">
                  {/* 会话信息 */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedSession.sessionName}</h2>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>学员: {selectedSession.student.profile.name}</p>
                          <p>任务目标: {selectedSession.taskConfig?.taskGoal || '产品介绍'}</p>
                          <p>方法论: {selectedSession.taskConfig?.methodology || 'FAB产品介绍技巧'}</p>
                          <p>客户: {selectedSession.customerProfile?.name} ({selectedSession.customerProfile?.profession})</p>
                          <p>提交时间: {new Date(selectedSession.submittedAt).toLocaleString('zh-CN')}</p>
                          <p>对话时长: {selectedSession.duration}分钟</p>
                        </div>
                      </div>
                      {selectedSession.aiEvaluation && (
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(selectedSession.aiEvaluation.overallScore)}`}>
                            {selectedSession.aiEvaluation.overallScore}
                          </div>
                          <div className="text-sm text-gray-500">AI综合评分</div>
                        </div>
                      )}
                    </div>

                    {/* 标签页 */}
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          onClick={() => setActiveTab('conversation')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'conversation'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          对话记录
                        </button>
                        {selectedSession.aiEvaluation && (
                          <button
                            onClick={() => setActiveTab('ai-evaluation')}
                            className={`py-2 px-1 border-b-2 font-medium text-sm ${
                              activeTab === 'ai-evaluation'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            AI评估参考
                          </button>
                        )}
                      </nav>
                    </div>

                    <div className="mt-4">
                      {/* 对话记录 */}
                      {activeTab === 'conversation' && (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {selectedSession.conversation.map((message, index) => (
                            <div key={index} className={`flex ${message.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                                message.role === 'student' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <p className="text-sm">{message.message}</p>
                                <p className={`text-xs mt-1 ${
                                  message.role === 'student' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* AI评估参考 */}
                      {activeTab === 'ai-evaluation' && selectedSession.aiEvaluation && (
                        <div className="space-y-4">
                          {selectedSession.aiEvaluation.dimensionScores.map((dimension: any, index: number) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-md font-medium text-gray-900">{dimension.dimension}</h4>
                                <span className={`text-lg font-bold ${getScoreColor(dimension.score)}`}>
                                  {dimension.score}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{dimension.feedback}</p>
                              
                              {dimension.details && dimension.details.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {dimension.details.map((detail: any, detailIndex: number) => (
                                    <div key={detailIndex} className="bg-gray-50 p-2 rounded text-xs">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium">{detail.criteria}</span>
                                        <span className={`font-bold ${getScoreColor(detail.score)}`}>
                                          {detail.score}
                                        </span>
                                      </div>
                                      <p className="text-gray-600 mt-1">{detail.feedback}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}

                          {selectedSession.aiEvaluation.suggestions && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <h4 className="text-md font-medium text-blue-800 mb-2">AI改进建议</h4>
                              <ul className="space-y-1">
                                {selectedSession.aiEvaluation.suggestions.map((suggestion: string, index: number) => (
                                  <li key={index} className="text-sm text-blue-700 flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    {suggestion}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 导师评估表单 */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">导师评估</h3>
                    
                    <div className="space-y-4">
                      {/* 评分 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          综合评分 (0-100)
                        </label>
                        <div className="flex items-center space-x-4">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={overallScore}
                            onChange={(e) => setOverallScore(parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <div className="flex items-center space-x-2">
                            <span className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
                              {overallScore}
                            </span>
                            <span className="text-sm text-gray-500">
                              {getScoreLabel(overallScore)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 反馈 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          详细反馈 *
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={6}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="请提供详细的评估反馈，包括表现优秀的方面和需要改进的地方..."
                        />
                      </div>

                      {/* 提交按钮 */}
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => setSelectedSession(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          取消
                        </button>
                        <button
                          onClick={submitEvaluation}
                          disabled={evaluating || !feedback.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                          {evaluating ? '提交中...' : '提交评估'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <div className="text-gray-400 text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">选择会话进行评估</h3>
                  <p className="text-gray-600">从左侧列表中选择一个待评估的会话开始评估</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
