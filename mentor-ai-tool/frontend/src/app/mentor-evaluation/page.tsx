
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getApiUrl } from '../../config';

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
  aiEvaluationStatus?: string;
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

interface DetailedScores {
  criteria1: number;
  criteria2: number;
  criteria3: number;
  criteria4: number;
  criteria5: number;
  criteria6: number;
  criteria7: number;
  criteria8: number;
  criteria9: number;
  criteria10: number;
  criteria11: number;
  criteria12: number;
  criteria13: number;
  criteria14: number;
}

const EVALUATION_CRITERIA = [
  { id: 'criteria1', dimension: '沟通维度', name: '匹配客户的沟通方式', icon: '🗣️' },
  { id: 'criteria2', dimension: '沟通维度', name: '识别客户的沟通方式', icon: '🗣️' },
  { id: 'criteria3', dimension: '沟通维度', name: '引导沟通的方向', icon: '🗣️' },
  { id: 'criteria4', dimension: '沟通维度', name: '清晰的表达自己的观点', icon: '🗣️' },
  { id: 'criteria5', dimension: '本品维度', name: '本品产品知识介绍', icon: '🚗' },
  { id: 'criteria6', dimension: '本品维度', name: '突出本产品的配置或者功能优势', icon: '🚗' },
  { id: 'criteria7', dimension: '本品维度', name: '清晰的确定客户的目标车型', icon: '🚗' },
  { id: 'criteria8', dimension: '竞品维度', name: '了解竞品的相关知识', icon: '🏁' },
  { id: 'criteria9', dimension: '竞品维度', name: '可以找出本品和竞品间的差异', icon: '🏁' },
  { id: 'criteria10', dimension: '竞品维度', name: '可以客观的进行竞品和本品的对比', icon: '🏁' },
  { id: 'criteria11', dimension: '客户信息获取维度', name: '了解了客户的兴趣爱好', icon: '👤' },
  { id: 'criteria12', dimension: '客户信息获取维度', name: '了解了客户的职业背景', icon: '👤' },
  { id: 'criteria13', dimension: '客户信息获取维度', name: '可以匹配客户的性格特征，进行沟通', icon: '👤' },
  { id: 'criteria14', dimension: '方法论匹配度', name: '可以在场景中，清晰运用预设的方法论', icon: '📋' }
];

export default function MentorEvaluation() {
  const [pendingSessions, setPendingSessions] = useState<PendingSession[]>([]);
  const [evaluatedSessions, setEvaluatedSessions] = useState<PendingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeListTab, setActiveListTab] = useState<'pending' | 'evaluated'>('pending');
  const [activeTab, setActiveTab] = useState<'conversation' | 'evaluation'>('conversation');
  const [aiEvaluationStatus, setAiEvaluationStatus] = useState<string>('unknown');
  const [isLoaded, setIsLoaded] = useState(false);
  const [feedback, setFeedback] = useState<string>('');
  
  const [detailedScores, setDetailedScores] = useState<DetailedScores>(() => {
    return {
      criteria1: 60, criteria2: 60, criteria3: 60, criteria4: 60,
      criteria5: 60, criteria6: 60, criteria7: 60,
      criteria8: 60, criteria9: 60, criteria10: 60,
      criteria11: 60, criteria12: 60, criteria13: 60,
      criteria14: 60
    };
  });

  const [userModifiedScores, setUserModifiedScores] = useState<Set<keyof DetailedScores>>(new Set());

  useEffect(() => {
    setIsLoaded(true);
    fetchPendingSessions();
    fetchEvaluatedSessions();
  }, []);

  const fetchPendingSessions = async () => {
    try {
      const response = await fetch(getApiUrl('/api/evaluations/pending'));
      
      if (response.ok) {
        const result = await response.json();
        setPendingSessions(result.data || []);
      } else {
        console.warn('获取待评估会话失败，使用空列表');
        setPendingSessions([]);
      }
    } catch (err) {
      console.error('Fetch pending sessions error:', err);
      console.warn('网络错误，使用空列表');
      setPendingSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluatedSessions = async () => {
    try {
      const response = await fetch(getApiUrl('/api/evaluations/history'));
      
      if (response.ok) {
        const result = await response.json();
        setEvaluatedSessions(result.data || []);
      } else {
        console.warn('获取已评估会话失败，使用空列表');
        setEvaluatedSessions([]);
      }
    } catch (err) {
      console.error('Fetch evaluated sessions error:', err);
      console.warn('网络错误，使用空列表');
      setEvaluatedSessions([]);
    }
  };

  const fetchSessionDetail = async (sessionId: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/sessions/${sessionId}/evaluation`));
      
      if (response.ok) {
        const result = await response.json();
        setSelectedSession(result.data);
        setActiveTab('conversation');
        setAiEvaluationStatus(result.data.aiEvaluationStatus || 'unknown');
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
      const requestBody: any = {
        feedback: feedback.trim(),
        evaluationMode: 'detailed',
        detailedScores: detailedScores
      };

      const response = await fetch(getApiUrl(`/api/evaluations/${selectedSession.sessionId}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        alert('评估提交成功！');
        await fetchPendingSessions();
        setSelectedSession(null);
        setFeedback('');
        setDetailedScores({
          criteria1: 60, criteria2: 60, criteria3: 60, criteria4: 60,
          criteria5: 60, criteria6: 60, criteria7: 60,
          criteria8: 60, criteria9: 60, criteria10: 60,
          criteria11: 60, criteria12: 60, criteria13: 60,
          criteria14: 60
        });
        setUserModifiedScores(new Set());
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

  const calculateDetailedAverages = () => {
    const communication = Math.floor((detailedScores.criteria1 + detailedScores.criteria2 + detailedScores.criteria3 + detailedScores.criteria4) / 4);
    const ownProduct = Math.floor((detailedScores.criteria5 + detailedScores.criteria6 + detailedScores.criteria7) / 3);
    const competitor = Math.floor((detailedScores.criteria8 + detailedScores.criteria9 + detailedScores.criteria10) / 3);
    const customerInfo = Math.floor((detailedScores.criteria11 + detailedScores.criteria12 + detailedScores.criteria13) / 3);
    const methodology = detailedScores.criteria14;
    
    const overall = Math.floor((communication + ownProduct + competitor + customerInfo + methodology) / 5);
    
    return {
      communication,
      ownProduct,
      competitor,
      customerInfo,
      methodology,
      overall
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const updateDetailedScore = (criteriaId: keyof DetailedScores, score: number) => {
    setDetailedScores(prev => ({
      ...prev,
      [criteriaId]: score
    }));
    
    setUserModifiedScores(prev => new Set(prev).add(criteriaId));
  };

  const averages = calculateDetailedAverages();

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
                <span className="text-xs text-muted-foreground block">导师评估界面</span>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/task-generator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                任务生成
              </Link>
              <Link href="/practice-chat" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                学员对话
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                数据面板
              </Link>
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">M</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">导师评估界面</h1>
              <p className="text-gray-600">查看学员练习记录，结合AI评估进行专业指导和反馈</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>待评估: {pendingSessions.length}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>已评估: {evaluatedSessions.length}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Session List */}
            <div className="lg:col-span-1">
              <div className={`card-glass transition-all duration-500 ${isLoaded ? 'animate-fade-in' : ''}`} style={{animationDelay: '0.1s'}}>
                {/* Tab Headers */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveListTab('pending')}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                        activeListTab === 'pending'
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>待评估</span>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                          {pendingSessions.length}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveListTab('evaluated')}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
                        activeListTab === 'evaluated'
                          ? 'bg-white text-green-700 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>已评估</span>
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          {evaluatedSessions.length}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Session List Content */}
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {activeListTab === 'pending' ? (
                    pendingSessions.length === 0 ? (
                      <div className="p-8 text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 text-sm">暂无待评估的会话</p>
                      </div>
                    ) : (
                      pendingSessions.map((session) => (
                        <div
                          key={session._id}
                          onClick={() => fetchSessionDetail(session._id)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedSession?.sessionId === session._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {session.sessionName}
                                </h4>
                                {(!session.aiEvaluation || session.aiEvaluationStatus === 'in_progress') && (
                                  <div className="flex items-center space-x-1">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                                    <span className="text-xs text-blue-600">AI运行中</span>
                                  </div>
                                )}
                                {session.aiEvaluation && session.aiEvaluationStatus === 'completed' && (
                                  <span className="text-xs text-green-600 flex items-center">
                                    <span className="mr-1">✅</span>
                                    AI完成
                                  </span>
                                )}
                              </div>
                              <div className="space-y-1 text-xs text-gray-500">
                                <p>学员: {session.studentId?.profile?.name || session.studentId?.username || '未知学员'}</p>
                                <p>提交: {new Date(session.submittedAt).toLocaleDateString('zh-CN')}</p>
                                <p>时长: {session.duration}分钟</p>
                              </div>
                            </div>
                            {session.aiEvaluation && session.aiEvaluation.overallScore != null && !isNaN(session.aiEvaluation.overallScore) && (
                              <div className="text-right">
                                <div className={`text-lg font-bold ${getScoreColor(Math.round(session.aiEvaluation.overallScore))}`}>
                                  {Math.round(session.aiEvaluation.overallScore)}
                                </div>
                                <div className="text-xs text-gray-500">AI评分</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    evaluatedSessions.length === 0 ? (
                      <div className="p-8 text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-gray-500 text-sm">暂无已评估的会话</p>
                      </div>
                    ) : (
                      evaluatedSessions.map((session: any) => (
                        <div
                          key={session._id}
                          onClick={() => fetchSessionDetail(session._id)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedSession?.sessionId === session._id ? 'bg-green-50 border-l-4 border-green-500' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate mb-2">
                                {session.sessionName}
                              </h4>
                              <div className="space-y-1 text-xs text-gray-500">
                                <p>学员: {session.studentId?.profile?.name || session.studentId?.username || '未知学员'}</p>
                                <p>提交: {new Date(session.submittedAt).toLocaleDateString('zh-CN')}</p>
                                <p>时长: {session.duration}分钟</p>
                                {session.mentorEvaluation?.evaluatedAt && (
                                  <p className="text-green-600">
                                    ✅ 已评估: {new Date(session.mentorEvaluation.evaluatedAt).toLocaleDateString('zh-CN')}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right space-y-1">
                              {session.aiEvaluation && session.aiEvaluation.overallScore != null && !isNaN(session.aiEvaluation.overallScore) && (
                                <div>
                                  <div className={`text-sm font-bold ${getScoreColor(Math.round(session.aiEvaluation.overallScore))}`}>
                                    AI: {Math.round(session.aiEvaluation.overallScore)}
                                  </div>
                                </div>
                              )}
                              {session.mentorEvaluation && session.mentorEvaluation.overallScore != null && !isNaN(session.mentorEvaluation.overallScore) && (
                                <div>
                                  <div className={`text-lg font-bold ${getScoreColor(Math.round(session.mentorEvaluation.overallScore))}`}>
                                    M: {Math.round(session.mentorEvaluation.overallScore)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Session Details and Evaluation */}
            <div className="lg:col-span-2">
              {selectedSession ? (
                <div className="space-y-6">
                  {/* Session Info */}
                  <div className={`card-glass p-6 transition-all duration-500 ${isLoaded ? 'animate-fade-in' : ''}`} style={{animationDelay: '0.2s'}}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">{selectedSession.sessionName}</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="mb-1"><span className="font-medium">学员:</span> {selectedSession.student?.profile?.name || selectedSession.student?.username || '未知学员'}</p>
                            <p className="mb-1"><span className="font-medium">任务目标:</span> {selectedSession.taskConfig?.taskGoal || '产品介绍'}</p>
                            <p className="mb-1"><span className="font-medium">方法论:</span> {selectedSession.taskConfig?.methodology || 'FAB产品介绍技巧'}</p>
                          </div>
                          <div>
                            <p className="mb-1"><span className="font-medium">客户:</span> {selectedSession.customerProfile?.name} ({selectedSession.customerProfile?.profession})</p>
                            <p className="mb-1"><span className="font-medium">提交时间:</span> {new Date(selectedSession.submittedAt).toLocaleString('zh-CN')}</p>
                            <p className="mb-1"><span className="font-medium">对话时长:</span> {selectedSession.duration}分钟</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {selectedSession.aiEvaluation && selectedSession.aiEvaluation.overallScore != null && !isNaN(selectedSession.aiEvaluation.overallScore) ? (
                          <div>
                            <div className={`text-3xl font-bold ${getScoreColor(Math.round(selectedSession.aiEvaluation.overallScore))}`}>
                              {Math.round(selectedSession.aiEvaluation.overallScore)}
                            </div>
                            <div className="text-sm text-gray-500">AI综合评分</div>
                          </div>
                        ) : (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-400">--</div>
                            <div className="text-sm text-gray-500">等待AI评估</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tab Navigation and Content */}
                  <div className={`card-glass transition-all duration-500 ${isLoaded ? 'animate-fade-in' : ''}`} style={{animationDelay: '0.3s'}}>
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        <button
                          onClick={() => setActiveTab('conversation')}
                          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeTab === 'conversation'
                              ? 'bg-white text-blue-700 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          对话记录
                        </button>
                        <button
                          onClick={() => setActiveTab('evaluation')}
                          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                            activeTab === 'evaluation'
                              ? 'bg-white text-orange-700 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          评估打分
                        </button>
                      </div>
                    </div>

                    <div className="p-6">
                      {activeTab === 'conversation' ? (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">对话记录</h3>
                          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-3">
                            {selectedSession.conversation && selectedSession.conversation.length > 0 ? (
                              selectedSession.conversation.map((message: any, index: number) => (
                                <div
                                  key={index}
                                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                      message.role === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-white text-gray-900 border border-gray-200'
                                    }`}
                                  >
                                    <div className="text-sm">{message.content}</div>
                                    <div className={`text-xs mt-1 ${
                                      message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                                    }`}>
                                      {message.role === 'user' ? '学员' : 'AI客户'}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center text-gray-500 py-8">
                                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p>暂无对话记录</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold text-gray-900">详细评估</h3>
                          
                          {/* Evaluation Form */}
                          <div className="space-y-4">
                            {EVALUATION_CRITERIA.map((criteria) => (
                              <div key={criteria.id} className="bg-gray-50 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  {criteria.icon} {criteria.name}
                                </label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={detailedScores[criteria.id as keyof DetailedScores]}
                                  onChange={(e) => updateDetailedScore(criteria.id as keyof DetailedScores, parseInt(e.target.value))}
                                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                  <span>0</span>
                                  <span className="font-medium text-gray-900">
                                    {detailedScores[criteria.id as keyof DetailedScores]}分
                                  </span>
                                  <span>100</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Overall Score Display */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                            <div className="text-center">
                              <div className={`text-4xl font-bold mb-2 ${getScoreColor(averages.overall)}`}>
                                {averages.overall}
                              </div>
                              <div className="text-lg font-medium text-gray-700 mb-4">综合评分</div>
                              <div className="grid grid-cols-5 gap-4 text-sm">
                                <div className="text-center">
                                  <div className={`text-lg font-bold ${getScoreColor(averages.communication)}`}>
                                    {averages.communication}
                                  </div>
                                  <div className="text-gray-600">沟通</div>
                                </div>
                                <div className="text-center">
                                  <div className={`text-lg font-bold ${getScoreColor(averages.ownProduct)}`}>
                                    {averages.ownProduct}
                                  </div>
                                  <div className="text-gray-600">本品</div>
                                </div>
                                <div className="text-center">
                                  <div className={`text-lg font-bold ${getScoreColor(averages.competitor)}`}>
                                    {averages.competitor}
                                  </div>
                                  <div className="text-gray-600">竞品</div>
                                </div>
                                <div className="text-center">
                                  <div className={`text-lg font-bold ${getScoreColor(averages.customerInfo)}`}>
                                    {averages.customerInfo}
                                  </div>
                                  <div className="text-gray-600">客户信息</div>
                                </div>
                                <div className="text-center">
                                  <div className={`text-lg font-bold ${getScoreColor(averages.methodology)}`}>
                                    {averages.methodology}
                                  </div>
                                  <div className="text-gray-600">方法论</div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Feedback */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              评估反馈 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="请输入详细的评估反馈和改进建议..."
                              className="input w-full h-32 resize-none"
                            />
                          </div>

                          {/* Submit Button */}
                          <div className="flex justify-end space-x-4">
                            <button
                              onClick={() => setSelectedSession(null)}
                              className="btn-secondary"
                            >
                              取消
                            </button>
                            <button
                              onClick={submitEvaluation}
                              disabled={evaluating || !feedback.trim()}
                              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {evaluating ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  提交中...
                                </div>
                              ) : (
                                '提交评估'
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className={`card-glass p-12 text-center transition-all duration-500 ${isLoaded ? 'animate-fade-in' : ''}`} style={{animationDelay: '0.2s'}}>
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">选择会话进行评估</h3>
                  <p className="text-gray-500">请从左侧列表中选择一个会话来查看详情和进行评估</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
                
