'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface CriteriaDetail {
  criteria: string;
  score: number;
  feedback: string;
}

interface DimensionScore {
  dimension: string;
  score: number;
  details?: CriteriaDetail[];
  feedback: string;
}

interface AIEvaluation {
  overallScore: number;
  dimensionScores: DimensionScore[];
  suggestions: string[];
  strengths?: string[];
  generatedAt: string;
}

interface MentorEvaluation {
  overallScore: number;
  feedback: string;
  evaluatedBy: {
    username: string;
    profile: { name: string };
  };
  evaluatedAt: string;
}

interface EvaluationData {
  sessionId: string;
  sessionName: string;
  status: string;
  submittedAt: string;
  duration: number;
  taskConfig: any;
  customerProfile: any;
  conversation: any[];
  aiEvaluation: AIEvaluation;
  mentorEvaluation?: MentorEvaluation;
  student: {
    username: string;
    profile: { name: string };
  };
}

export default function EvaluationResult() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'mentor' | 'conversation'>('ai');

  useEffect(() => {
    if (sessionId) {
      fetchEvaluationData(sessionId);
    } else {
      setError('会话ID未提供');
      setLoading(false);
    }
  }, [sessionId]);

  const fetchEvaluationData = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/sessions/${id}/evaluation`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // 添加数据验证，确保必要字段存在
          const data = result.data;
          if (!data.sessionId && !data._id) {
            setError('会话数据缺少必要的ID字段');
            return;
          }
          
          // 确保学生信息存在
          if (!data.student) {
            data.student = {
              username: 'unknown',
              profile: { name: '未知用户' }
            };
          }
          
          setEvaluationData(data);
        } else {
          setError('评估数据不完整或格式错误');
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: '服务器响应错误' }));
        setError(errorData.error || '获取评估数据失败');
      }
    } catch (err) {
      console.error('Fetch evaluation error:', err);
      setError('网络错误，请稍后重试。请确保后端服务正在运行。');
    } finally {
      setLoading(false);
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

  const getProgressBarColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">正在加载评估结果...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">加载失败</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link href="/practice-chat" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            返回练习
          </Link>
        </div>
      </div>
    );
  }

  if (!evaluationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">未找到评估数据</h2>
          <Link href="/practice-chat" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            返回练习
          </Link>
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
              <span className="ml-2 text-sm text-gray-500">评估结果</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/practice-chat" className="text-sm text-gray-600 hover:text-blue-600">
                继续练习
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">
                数据面板
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{evaluationData.sessionName}</h1>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>任务目标: {evaluationData.taskConfig?.taskGoal || '产品介绍'}</p>
                  <p>方法论: {evaluationData.taskConfig?.methodology || 'FAB产品介绍技巧'}</p>
                  <p>客户: {evaluationData.customerProfile?.name || '客户'} ({evaluationData.customerProfile?.profession || '未知职业'})</p>
                  <p>提交时间: {evaluationData.submittedAt ? new Date(evaluationData.submittedAt).toLocaleString('zh-CN') : '未知时间'}</p>
                  <p>对话时长: {evaluationData.duration || 0}分钟</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">
                  {evaluationData.aiEvaluation?.overallScore || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">AI综合评分</div>
                {evaluationData.mentorEvaluation && (
                  <div className="mt-2">
                    <div className="text-2xl font-bold text-green-600">
                      {evaluationData.mentorEvaluation.overallScore}
                    </div>
                    <div className="text-sm text-gray-500">导师评分</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ai'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  AI评估结果
                </button>
                {evaluationData.mentorEvaluation && (
                  <button
                    onClick={() => setActiveTab('mentor')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'mentor'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    导师评估
                  </button>
                )}
                <button
                  onClick={() => setActiveTab('conversation')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'conversation'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  对话回顾
                </button>
              </nav>
            </div>

            <div className="p-6">
              {/* AI Evaluation Tab */}
              {activeTab === 'ai' && evaluationData.aiEvaluation && (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {evaluationData.aiEvaluation.overallScore}
                    </div>
                    <div className="text-lg text-gray-600">
                      {getScoreLabel(evaluationData.aiEvaluation.overallScore)} - AI综合评分
                    </div>
                  </div>

                  {/* Dimension Scores */}
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">详细评估</h3>
                    {evaluationData.aiEvaluation.dimensionScores.map((dimension, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-md font-medium text-gray-900">{dimension.dimension}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`text-lg font-bold ${getScoreColor(dimension.score)}`}>
                              {dimension.score}
                            </span>
                            <span className="text-sm text-gray-500">
                              {getScoreLabel(dimension.score)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div 
                            className={`h-2 rounded-full ${getProgressBarColor(dimension.score)}`}
                            style={{ width: `${dimension.score}%` }}
                          ></div>
                        </div>

                        {/* Dimension Feedback */}
                        <p className="text-sm text-gray-600 mb-3">{dimension.feedback}</p>

                        {/* Detailed Criteria */}
                        {dimension.details && dimension.details.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-sm font-medium text-gray-700">具体评估细则:</h5>
                            {dimension.details.map((detail, detailIndex) => (
                              <div key={detailIndex} className="bg-gray-50 p-3 rounded">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-gray-700">
                                    {detail.criteria}
                                  </span>
                                  <span className={`text-sm font-bold ${getScoreColor(detail.score)}`}>
                                    {detail.score}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600">{detail.feedback}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Strengths */}
                  {evaluationData.aiEvaluation.strengths && evaluationData.aiEvaluation.strengths.length > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-md font-medium text-green-800 mb-2">表现优秀的方面</h4>
                      <ul className="space-y-1">
                        {evaluationData.aiEvaluation.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-start">
                            <span className="text-green-500 mr-2">✓</span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {evaluationData.aiEvaluation.suggestions && evaluationData.aiEvaluation.suggestions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-md font-medium text-blue-800 mb-2">改进建议</h4>
                      <ul className="space-y-1">
                        {evaluationData.aiEvaluation.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-blue-700 flex items-start">
                            <span className="text-blue-500 mr-2">💡</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Mentor Evaluation Tab */}
              {activeTab === 'mentor' && evaluationData.mentorEvaluation && (
                <div className="space-y-6">
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {evaluationData.mentorEvaluation.overallScore}
                    </div>
                    <div className="text-lg text-gray-600">
                      {getScoreLabel(evaluationData.mentorEvaluation.overallScore)} - 导师评分
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      评估导师: {evaluationData.mentorEvaluation.evaluatedBy?.profile?.name || '未知导师'}
                    </div>
                    <div className="text-sm text-gray-500">
                      评估时间: {evaluationData.mentorEvaluation.evaluatedAt ? new Date(evaluationData.mentorEvaluation.evaluatedAt).toLocaleString('zh-CN') : '未知时间'}
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">导师反馈</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{evaluationData.mentorEvaluation.feedback}</p>
                  </div>
                </div>
              )}

              {/* Conversation Tab */}
              {activeTab === 'conversation' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">对话回顾</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {evaluationData.conversation.map((message, index) => (
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
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Link 
              href="/practice-chat" 
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
            >
              开始新的练习
            </Link>
            <Link 
              href="/dashboard" 
              className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700 font-medium"
            >
              查看历史记录
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
