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
  criteria1: number;  // 匹配客户的沟通方式
  criteria2: number;  // 识别客户的沟通方式
  criteria3: number;  // 引导沟通的方向
  criteria4: number;  // 清晰的表达自己的观点
  criteria5: number;  // 本品产品知识正确
  criteria6: number;  // 突出本产品的配置或者功能优势
  criteria7: number;  // 清晰的确定客户的目标车型
  criteria8: number;  // 了解竞品的相关知识
  criteria9: number;  // 可以找出本品和竞品间的差异
  criteria10: number; // 可以客观的进行竞品和本品的对比
  criteria11: number; // 了解了客户的兴趣爱好
  criteria12: number; // 了解了客户的职业背景
  criteria13: number; // 可以匹配客户的性格特征，进行沟通
  criteria14: number; // 可以在场景中，清晰运用预设的方法论
}

// 14个评判标准的定义
const EVALUATION_CRITERIA = [
  // 沟通维度
  { id: 'criteria1', dimension: '沟通维度', name: '匹配客户的沟通方式', icon: '🗣️' },
  { id: 'criteria2', dimension: '沟通维度', name: '识别客户的沟通方式', icon: '🗣️' },
  { id: 'criteria3', dimension: '沟通维度', name: '引导沟通的方向', icon: '🗣️' },
  { id: 'criteria4', dimension: '沟通维度', name: '清晰的表达自己的观点', icon: '🗣️' },
  // 本品维度
  { id: 'criteria5', dimension: '本品维度', name: '本品产品知识介绍', icon: '🚗' },
  { id: 'criteria6', dimension: '本品维度', name: '突出本产品的配置或者功能优势', icon: '🚗' },
  { id: 'criteria7', dimension: '本品维度', name: '清晰的确定客户的目标车型', icon: '🚗' },
  // 竞品维度
  { id: 'criteria8', dimension: '竞品维度', name: '了解竞品的相关知识', icon: '🏁' },
  { id: 'criteria9', dimension: '竞品维度', name: '可以找出本品和竞品间的差异', icon: '🏁' },
  { id: 'criteria10', dimension: '竞品维度', name: '可以客观的进行竞品和本品的对比', icon: '🏁' },
  // 客户信息获取维度
  { id: 'criteria11', dimension: '客户信息获取维度', name: '了解了客户的兴趣爱好', icon: '👤' },
  { id: 'criteria12', dimension: '客户信息获取维度', name: '了解了客户的职业背景', icon: '👤' },
  { id: 'criteria13', dimension: '客户信息获取维度', name: '可以匹配客户的性格特征，进行沟通', icon: '👤' },
  // 方法论匹配度
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
  const [aiEvaluationStatus, setAiEvaluationStatus] = useState<string>('unknown');
  
  // 只使用详细评估模式
  const [feedback, setFeedback] = useState<string>('');
  
  // 详细评估状态 - 使用65-90的随机分数
  const [detailedScores, setDetailedScores] = useState<DetailedScores>(() => {
    const generateRandomScore = () => Math.floor(Math.random() * 26) + 65; // 65-90随机分数
    return {
      criteria1: generateRandomScore(), criteria2: generateRandomScore(), 
      criteria3: generateRandomScore(), criteria4: generateRandomScore(),
      criteria5: generateRandomScore(), criteria6: generateRandomScore(), 
      criteria7: generateRandomScore(),
      criteria8: generateRandomScore(), criteria9: generateRandomScore(), 
      criteria10: generateRandomScore(),
      criteria11: generateRandomScore(), criteria12: generateRandomScore(), 
      criteria13: generateRandomScore(),
      criteria14: generateRandomScore()
    };
  });
  
  const [activeTab, setActiveTab] = useState<'conversation' | 'ai-evaluation' | 'criteria-reference'>('conversation');

  useEffect(() => {
    fetchPendingSessions();
    fetchEvaluatedSessions();
    
    // 设置定期刷新待评估列表，以更新AI评估状态
    const refreshInterval = setInterval(() => {
      fetchPendingSessions();
    }, 10000); // 每10秒刷新一次
    
    return () => clearInterval(refreshInterval);
  }, []);

  // 监控AI评估状态
  useEffect(() => {
    if (selectedSession?.sessionId) {
      checkAIEvaluationStatus(selectedSession.sessionId);
      
      // 如果AI评估正在进行中，设置定时器检查状态
      const interval = setInterval(() => {
        checkAIEvaluationStatus(selectedSession.sessionId);
      }, 3000); // 每3秒检查一次

      return () => clearInterval(interval);
    }
  }, [selectedSession?.sessionId]);

  const fetchPendingSessions = async () => {
    try {
      const response = await fetch(getApiUrl('/api/evaluations/pending'));
      
      if (response.ok) {
        const result = await response.json();
        setPendingSessions(result.data || []);
        setError(null); // 清除之前的错误
      } else {
        console.warn('获取待评估会话失败，使用空列表');
        setPendingSessions([]); // 设置为空数组而不是显示错误
        setError(null);
      }
    } catch (err) {
      console.error('Fetch pending sessions error:', err);
      console.warn('网络错误，使用空列表');
      setPendingSessions([]); // 设置为空数组而不是显示错误
      setError(null);
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
        console.error('获取已评估会话失败');
      }
    } catch (err) {
      console.error('Fetch evaluated sessions error:', err);
    }
  };

  const fetchSessionDetail = async (sessionId: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/sessions/${sessionId}/evaluation`));
      
      if (response.ok) {
        const result = await response.json();
        setSelectedSession(result.data);
        setActiveTab('conversation');
        
        // 设置AI评估状态
        setAiEvaluationStatus(result.data.aiEvaluationStatus || 'unknown');
        
        // 如果有AI评估，设置详细评分的初始值
        if (result.data.aiEvaluation?.dimensionScores) {
          const aiScores = result.data.aiEvaluation.dimensionScores;
          const newDetailedScores = { ...detailedScores };
          
          // 根据AI评估的具体标准分数设置初始值
          aiScores.forEach((dimension: any) => {
            if (dimension.details && dimension.details.length > 0) {
              // 使用具体标准的分数
              dimension.details.forEach((detail: any) => {
                if (detail.id && typeof detail.score === 'number') {
                  const criteriaKey = detail.id as keyof DetailedScores;
                  if (criteriaKey in newDetailedScores) {
                    newDetailedScores[criteriaKey] = Math.round(detail.score);
                  }
                }
              });
            } else {
              // 如果没有详细分数，使用维度分数作为默认值
              const score = Math.round(dimension.score || 75);
              switch (dimension.dimension) {
                case '沟通维度':
                  newDetailedScores.criteria1 = score;
                  newDetailedScores.criteria2 = score;
                  newDetailedScores.criteria3 = score;
                  newDetailedScores.criteria4 = score;
                  break;
                case '本品维度':
                  newDetailedScores.criteria5 = score;
                  newDetailedScores.criteria6 = score;
                  newDetailedScores.criteria7 = score;
                  break;
                case '竞品维度':
                  newDetailedScores.criteria8 = score;
                  newDetailedScores.criteria9 = score;
                  newDetailedScores.criteria10 = score;
                  break;
                case '客户信息获取维度':
                  newDetailedScores.criteria11 = score;
                  newDetailedScores.criteria12 = score;
                  newDetailedScores.criteria13 = score;
                  break;
                case '方法论匹配度':
                  newDetailedScores.criteria14 = score;
                  break;
              }
            }
          });
          
          setDetailedScores(newDetailedScores);
        }
      } else {
        setError('获取会话详情失败');
      }
    } catch (err) {
      console.error('Fetch session detail error:', err);
      setError('网络错误，请稍后重试');
    }
  };

  const checkAIEvaluationStatus = async (sessionId: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/sessions/${sessionId}/ai-evaluation-status`));
      
      if (response.ok) {
        const result = await response.json();
        const status = result.data.aiEvaluationStatus;
        setAiEvaluationStatus(status);
        
        // 如果AI评估完成，重新获取会话详情以更新AI评估结果
        if (status === 'completed' && aiEvaluationStatus === 'in_progress') {
          fetchSessionDetail(sessionId);
        }
      }
    } catch (err) {
      console.error('Check AI evaluation status error:', err);
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
        // 刷新待评估列表
        await fetchPendingSessions();
        // 清空选中的会话
        setSelectedSession(null);
        setFeedback('');
        // 重置为新的随机分数
        const generateRandomScore = () => Math.floor(Math.random() * 26) + 65; // 65-90随机分数
        setDetailedScores({
          criteria1: generateRandomScore(), criteria2: generateRandomScore(), 
          criteria3: generateRandomScore(), criteria4: generateRandomScore(),
          criteria5: generateRandomScore(), criteria6: generateRandomScore(), 
          criteria7: generateRandomScore(),
          criteria8: generateRandomScore(), criteria9: generateRandomScore(), 
          criteria10: generateRandomScore(),
          criteria11: generateRandomScore(), criteria12: generateRandomScore(), 
          criteria13: generateRandomScore(),
          criteria14: generateRandomScore()
        });
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

  // 计算详细评分的各维度平均分和总分
  const calculateDetailedAverages = () => {
    const communication = Math.floor((detailedScores.criteria1 + detailedScores.criteria2 + detailedScores.criteria3 + detailedScores.criteria4) / 4);
    const ownProduct = Math.floor((detailedScores.criteria5 + detailedScores.criteria6 + detailedScores.criteria7) / 3);
    const competitor = Math.floor((detailedScores.criteria8 + detailedScores.criteria9 + detailedScores.criteria10) / 3);
    const customerInfo = Math.floor((detailedScores.criteria11 + detailedScores.criteria12 + detailedScores.criteria13) / 3);
    const methodology = Math.floor(detailedScores.criteria14);
    
    const overall = Math.floor(Object.values(detailedScores).reduce((sum, score) => sum + score, 0) / 14);
    
    return { communication, ownProduct, competitor, customerInfo, methodology, overall };
  };

  // 更新详细评分
  const updateDetailedScore = (criteriaId: keyof DetailedScores, score: number) => {
    setDetailedScores(prev => ({
      ...prev,
      [criteriaId]: score
    }));
  };

  // 批量设置分数
  const setBatchScore = (score: number) => {
    const newScores = { ...detailedScores };
    Object.keys(newScores).forEach(key => {
      newScores[key as keyof DetailedScores] = score;
    });
    setDetailedScores(newScores);
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

  const detailedAverages = calculateDetailedAverages();

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
              <span className="ml-2 text-sm text-gray-500">Mentor评估</span>
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
            <h1 className="text-2xl font-bold text-gray-900">Mentor评估中心</h1>
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
            {/* 会话列表 */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                {/* 标签页切换 */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setActiveListTab('pending')}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        activeListTab === 'pending'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      待评估 ({pendingSessions.length})
                    </button>
                    <button
                      onClick={() => setActiveListTab('evaluated')}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        activeListTab === 'evaluated'
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      已评估 ({evaluatedSessions.length})
                    </button>
                  </div>
                </div>

                {/* 会话列表内容 */}
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {activeListTab === 'pending' ? (
                    pendingSessions.length === 0 ? (
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
                              <div className="flex items-center space-x-2 mb-1">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {session.sessionName}
                                </h4>
                                {/* AI评估状态指示器 */}
                                {(!session.aiEvaluation || session.aiEvaluationStatus === 'in_progress') && (
                                  <div className="flex items-center space-x-1">
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                                    <span className="text-xs text-blue-600">AI正在运行</span>
                                  </div>
                                )}
                                {session.aiEvaluation && session.aiEvaluationStatus === 'completed' && (
                                  <span className="text-xs text-green-600 flex items-center">
                                    <span className="mr-1">✅</span>
                                    AI已完成
                                  </span>
                                )}
                                {session.aiEvaluationStatus === 'failed' && (
                                  <span className="text-xs text-red-600 flex items-center">
                                    <span className="mr-1">❌</span>
                                    AI失败
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                学员: {session.studentId?.profile?.name || session.studentId?.username || '未知学员'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                提交: {new Date(session.submittedAt).toLocaleDateString('zh-CN')}
                              </p>
                              <p className="text-xs text-gray-500">
                                时长: {session.duration}分钟
                              </p>
                            </div>
                            {session.aiEvaluation && session.aiEvaluation.overallScore != null && !isNaN(session.aiEvaluation.overallScore) && (
                              <div className="text-right">
                                <div className={`text-sm font-bold ${getScoreColor(Math.round(session.aiEvaluation.overallScore))}`}>
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
                      <div className="p-6 text-center text-gray-500">
                        暂无已评估的会话
                      </div>
                    ) : (
                      evaluatedSessions.map((session: any) => (
                        <div
                          key={session._id}
                          onClick={() => fetchSessionDetail(session._id)}
                          className={`p-4 cursor-pointer hover:bg-gray-50 ${
                            selectedSession?.sessionId === session._id ? 'bg-green-50 border-l-4 border-green-500' : ''
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {session.sessionName}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1">
                                学员: {session.studentId?.profile?.name || session.studentId?.username || '未知学员'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                提交: {new Date(session.submittedAt).toLocaleDateString('zh-CN')}
                              </p>
                              <p className="text-xs text-gray-500">
                                时长: {session.duration}分钟
                              </p>
                              {session.mentorEvaluation?.evaluatedAt && (
                                <p className="text-xs text-green-600 mt-1">
                                  ✅ 已评估: {new Date(session.mentorEvaluation.evaluatedAt).toLocaleDateString('zh-CN')}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              {session.aiEvaluation && session.aiEvaluation.overallScore != null && !isNaN(session.aiEvaluation.overallScore) && (
                                <div className="mb-1">
                                  <div className={`text-xs font-bold ${getScoreColor(Math.round(session.aiEvaluation.overallScore))}`}>
                                    AI: {Math.round(session.aiEvaluation.overallScore)}
                                  </div>
                                </div>
                              )}
                              {session.mentorEvaluation && session.mentorEvaluation.overallScore != null && !isNaN(session.mentorEvaluation.overallScore) && (
                                <div>
                                  <div className={`text-sm font-bold ${getScoreColor(Math.round(session.mentorEvaluation.overallScore))}`}>
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
                          <p>学员: {selectedSession.student?.profile?.name || selectedSession.student?.username || '未知学员'}</p>
                          <p>任务目标: {selectedSession.taskConfig?.taskGoal || '产品介绍'}</p>
                          <p>方法论: {selectedSession.taskConfig?.methodology || 'FAB产品介绍技巧'}</p>
                          <p>客户: {selectedSession.customerProfile?.name} ({selectedSession.customerProfile?.profession})</p>
                          <p>提交时间: {new Date(selectedSession.submittedAt).toLocaleString('zh-CN')}</p>
                          <p>对话时长: {selectedSession.duration}分钟</p>
                          
                          {/* AI评估状态显示 */}
                          <div className="flex items-center space-x-2">
                            <span>AI评估状态:</span>
                            {aiEvaluationStatus === 'in_progress' && (
                              <div className="flex items-center space-x-1 text-blue-600">
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                                <span className="text-xs">正在评估中...</span>
                              </div>
                            )}
                            {aiEvaluationStatus === 'completed' && (
                              <span className="text-xs text-green-600 flex items-center">
                                <span className="mr-1">✅</span>
                                评估完成
                              </span>
                            )}
                            {aiEvaluationStatus === 'failed' && (
                              <span className="text-xs text-red-600 flex items-center">
                                <span className="mr-1">❌</span>
                                评估失败
                              </span>
                            )}
                            {aiEvaluationStatus === 'unknown' && (
                              <span className="text-xs text-gray-500">状态未知</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {selectedSession.aiEvaluation && selectedSession.aiEvaluation.overallScore != null && !isNaN(selectedSession.aiEvaluation.overallScore) ? (
                          <div>
                            <div className={`text-2xl font-bold ${getScoreColor(Math.round(selectedSession.aiEvaluation.overallScore))}`}>
                              {Math.round(selectedSession.aiEvaluation.overallScore)}
                            </div>
                            <div className="text-sm text-gray-500">AI综合评分</div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                            <div className="text-sm text-gray-500 mt-2">AI评分中</div>
                          </div>
                        )}
                      </div>
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
                        <button
                          onClick={() => setActiveTab('criteria-reference')}
                          className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'criteria-reference'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          评判标准
                        </button>
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
                                <span className={`text-lg font-bold ${getScoreColor(Math.round(dimension.score))}`}>
                                  {Math.round(dimension.score)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{dimension.feedback}</p>
                              
                              {dimension.details && dimension.details.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {dimension.details.map((detail: any, detailIndex: number) => (
                                    <div key={detailIndex} className="bg-gray-50 p-2 rounded text-xs">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium">{detail.criteria}</span>
                                        <span className={`font-bold ${getScoreColor(Math.round(detail.score))}`}>
                                          {Math.round(detail.score)}
                                        </span>
                                      </div>
                                      <p className="text-gray-600 mt-1">{detail.feedback}</p>
                                      {detail.evidence && (
                                        <div className="mt-2 p-2 bg-gray-100 border-l-2 border-gray-300">
                                          <p className="text-xs text-gray-500 italic">对话依据: "{detail.evidence}"</p>
                                        </div>
                                      )}
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

                      {/* 评判标准参考 */}
                      {activeTab === 'criteria-reference' && (
                        <div className="space-y-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="text-lg font-medium text-blue-800 mb-3">📊 14个评判标准总览</h4>
                            <p className="text-sm text-blue-700 mb-4">
                              以下是完整的评判标准，导师可以根据这些标准对学员的表现进行详细评估。
                            </p>
                          </div>

                          {/* 按维度分组显示标准 */}
                          {['沟通维度', '本品维度', '竞品维度', '客户信息获取维度', '方法论匹配度'].map((dimensionName, dimIndex) => {
                            const dimensionCriteria = EVALUATION_CRITERIA.filter(c => c.dimension === dimensionName);
                            const dimensionIcon = dimensionCriteria[0]?.icon || '📋';
                            
                            return (
                              <div key={dimIndex} className="border border-gray-200 rounded-lg p-4">
                                <h5 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                                  <span className="mr-2">{dimensionIcon}</span>
                                  {dimensionName} ({dimensionCriteria.length}个细则)
                                </h5>
                                <div className="space-y-2">
                                  {dimensionCriteria.map((criteria, index) => (
                                    <div key={criteria.id} className="bg-gray-50 p-3 rounded text-sm">
                                      <div className="flex items-start">
                                        <span className="font-medium text-gray-700 mr-2">
                                          {EVALUATION_CRITERIA.findIndex(c => c.id === criteria.id) + 1}.
                                        </span>
                                        <span className="text-gray-800">{criteria.name}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mentor评估表单 */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Mentor详细评估</h3>
                    
                    <div className="space-y-6">
                      {/* 评分总览 */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="text-md font-medium text-gray-900 mb-3">📊 评分总览</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getScoreColor(detailedAverages.communication)}`}>
                              {detailedAverages.communication}
                            </div>
                            <div className="text-gray-600">🗣️ 沟通维度</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getScoreColor(detailedAverages.ownProduct)}`}>
                              {detailedAverages.ownProduct}
                            </div>
                            <div className="text-gray-600">🚗 本品维度</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getScoreColor(detailedAverages.competitor)}`}>
                              {detailedAverages.competitor}
                            </div>
                            <div className="text-gray-600">🏁 竞品维度</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getScoreColor(detailedAverages.customerInfo)}`}>
                              {detailedAverages.customerInfo}
                            </div>
                            <div className="text-gray-600">👤 客户信息</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${getScoreColor(detailedAverages.methodology)}`}>
                              {detailedAverages.methodology}
                            </div>
                            <div className="text-gray-600">📋 方法论</div>
                          </div>
                          <div className="text-center border-l-2 border-blue-500 pl-4">
                            <div className={`text-xl font-bold ${getScoreColor(detailedAverages.overall)}`}>
                              {detailedAverages.overall}
                            </div>
                            <div className="text-gray-600">💯 总分</div>
                          </div>
                        </div>
                      </div>

                      {/* 批量操作 */}
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-600">快速设置:</span>
                        <button
                          onClick={() => setBatchScore(90)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          全部90分
                        </button>
                        <button
                          onClick={() => setBatchScore(80)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          全部80分
                        </button>
                        <button
                          onClick={() => setBatchScore(70)}
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                        >
                          全部70分
                        </button>
                      </div>

                      {/* 详细评分表单 */}
                      <div className="space-y-6">
                        {['沟通维度', '本品维度', '竞品维度', '客户信息获取维度', '方法论匹配度'].map((dimensionName, dimIndex) => {
                          const dimensionCriteria = EVALUATION_CRITERIA.filter(c => c.dimension === dimensionName);
                          const dimensionIcon = dimensionCriteria[0]?.icon || '📋';
                          
                          return (
                            <div key={dimIndex} className="border border-gray-200 rounded-lg p-4">
                              <h5 className="text-md font-medium text-gray-900 mb-4 flex items-center">
                                <span className="mr-2">{dimensionIcon}</span>
                                {dimensionName}
                              </h5>
                              <div className="space-y-4">
                                {dimensionCriteria.map((criteria) => {
                                  const aiDetail = selectedSession?.aiEvaluation?.dimensionScores
                                    ?.flatMap((d: any) => d.details || [])
                                    .find((detail: any) => detail?.id === criteria.id);

                                  return (
                                    <div key={criteria.id} className="space-y-2">
                                      <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-700">
                                          {EVALUATION_CRITERIA.findIndex(c => c.id === criteria.id) + 1}. {criteria.name}
                                        </label>
                                        <div className="flex items-center space-x-2">
                                          <span className={`text-lg font-bold ${getScoreColor(detailedScores[criteria.id as keyof DetailedScores])}`}>
                                            {detailedScores[criteria.id as keyof DetailedScores]}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {getScoreLabel(detailedScores[criteria.id as keyof DetailedScores])}
                                          </span>
                                        </div>
                                      </div>
                                      <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={detailedScores[criteria.id as keyof DetailedScores]}
                                        onChange={(e) => updateDetailedScore(criteria.id as keyof DetailedScores, parseInt(e.target.value))}
                                        className="w-full"
                                      />
                                      {aiDetail && (
                                        <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-300 rounded-r-lg">
                                          <p className="text-xs text-blue-800">
                                            <span className="font-bold">AI评分: {Math.round(aiDetail.score)}</span> - {aiDetail.feedback}
                                          </p>
                                          {aiDetail.evidence && (
                                            <p className="text-xs text-gray-600 italic mt-1">
                                              依据: "{aiDetail.evidence}"
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* 反馈 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          详细反馈 *
                        </label>
                        
                        {/* 快捷反馈选项 */}
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-600 mb-2">快捷反馈模板：</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {/* 优点模板 */}
                            <div>
                              <div className="text-xs text-green-700 font-medium mb-1">✅ 优点模板</div>
                              <div className="space-y-1">
                                {[
                                  "沟通技巧出色，能够很好地识别和匹配客户的沟通方式",
                                  "产品知识扎实，能够准确介绍车型配置和技术参数",
                                  "竞品分析到位，客观地进行了产品对比",
                                  "善于挖掘客户需求，了解客户的兴趣爱好和职业背景",
                                  "销售方法论运用熟练，FAB技巧使用得当",
                                  "表达清晰，逻辑性强，能够引导对话方向"
                                ].map((template, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setFeedback(prev => prev + (prev ? '\n\n' : '') + '✅ ' + template)}
                                    className="block w-full text-left px-2 py-1 text-xs bg-green-50 hover:bg-green-100 border border-green-200 rounded text-green-800 transition-colors"
                                  >
                                    {template}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* 缺点模板 */}
                            <div>
                              <div className="text-xs text-red-700 font-medium mb-1">❌ 需要改进</div>
                              <div className="space-y-1">
                                {[
                                  "需要加强对客户沟通方式的识别和适应能力",
                                  "产品知识有待提升，特别是技术细节方面",
                                  "竞品了解不够深入，建议加强竞品学习",
                                  "客户需求挖掘不够充分，可以更多了解客户背景",
                                  "销售方法论运用不够熟练，需要多加练习",
                                  "表达不够清晰，逻辑性有待加强"
                                ].map((template, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setFeedback(prev => prev + (prev ? '\n\n' : '') + '❌ ' + template)}
                                    className="block w-full text-left px-2 py-1 text-xs bg-red-50 hover:bg-red-100 border border-red-200 rounded text-red-800 transition-colors"
                                  >
                                    {template}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* 综合评价模板 */}
                          <div className="mt-3">
                            <div className="text-xs text-blue-700 font-medium mb-1">💡 综合评价模板</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                              {[
                                "总体表现良好，在沟通和产品介绍方面表现出色，建议继续保持并加强竞品知识学习。",
                                "本次对话展现了扎实的销售基础，特别是需求挖掘方面做得很好，建议在表达逻辑上进一步优化。",
                                "沟通技巧有待提升，建议多练习不同类型客户的应对策略，同时加强产品知识学习。",
                                "整体表现中等，在客户信息获取方面做得不错，建议加强销售方法论的实际运用。"
                              ].map((template, index) => (
                                <button
                                  key={index}
                                  onClick={() => setFeedback(prev => prev + (prev ? '\n\n' : '') + '💡 ' + template)}
                                  className="block w-full text-left px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-blue-800 transition-colors"
                                >
                                  {template}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* 清空按钮 */}
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => setFeedback('')}
                              className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-gray-700 transition-colors"
                            >
                              清空反馈
                            </button>
                          </div>
                        </div>
                        
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={8}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="请提供详细的评估反馈，包括表现优秀的方面和需要改进的地方...&#10;&#10;您可以使用上方的快捷模板，点击后会自动添加到此处，然后可以根据实际情况进行修改。"
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
