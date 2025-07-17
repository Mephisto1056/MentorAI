// 改进的刷新机制示例代码

import { useState, useEffect, useCallback } from 'react';

interface PendingSession {
  _id: string;
  sessionName: string;
  aiEvaluationStatus?: string;
}

interface SessionDetail {
  sessionId: string;
  sessionName: string;
  aiEvaluationStatus?: string;
}

export default function ImprovedMentorEvaluation() {
  const [pendingSessions, setPendingSessions] = useState<PendingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [aiEvaluationStatus, setAiEvaluationStatus] = useState<string>('unknown');

  // 改进1: 使用useCallback优化刷新函数
  const fetchPendingSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/evaluations/pending');
      if (response.ok) {
        const result = await response.json();
        setPendingSessions(result.data || []);
      }
    } catch (err) {
      console.error('Fetch pending sessions error:', err);
    }
  }, []);

  // 改进6: 优化会话详情获取
  const fetchSessionDetail = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/evaluation`);
      if (response.ok) {
        const result = await response.json();
        setSelectedSession(result.data);
        setAiEvaluationStatus(result.data.aiEvaluationStatus || 'unknown');
      }
    } catch (err) {
      console.error('Fetch session detail error:', err);
    }
  }, []);

  // 改进5: 添加通知系统
  const showNotification = (message: string, type: string = 'info') => {
    // 可以使用toast库或自定义通知组件
    console.log(`[${type.toUpperCase()}] ${message}`);
    // 实际实现中可以使用react-hot-toast等库
  };

  // 改进2: 智能轮询 - 根据AI评估状态调整频率
  useEffect(() => {
    const hasInProgressEvaluations = pendingSessions.some(
      session => session.aiEvaluationStatus === 'in_progress'
    );
    
    // 如果有正在进行的AI评估，增加刷新频率
    const refreshInterval = hasInProgressEvaluations ? 2000 : 10000; // 2秒 vs 10秒
    
    const interval = setInterval(fetchPendingSessions, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchPendingSessions, pendingSessions]);

  // 改进3: 实时状态检查 - 当选中会话时更频繁检查
  useEffect(() => {
    if (selectedSession?.sessionId && aiEvaluationStatus === 'in_progress') {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/sessions/${selectedSession.sessionId}/ai-evaluation-status`);
          if (response.ok) {
            const result = await response.json();
            const newStatus = result.data.aiEvaluationStatus;
            setAiEvaluationStatus(newStatus);
            
            // 改进4: AI评估完成后立即刷新详情和列表
            if (newStatus === 'completed' && aiEvaluationStatus === 'in_progress') {
              // 刷新会话详情
              fetchSessionDetail(selectedSession.sessionId);
              // 刷新待评估列表
              fetchPendingSessions();
              // 显示完成通知
              showNotification('AI评估已完成！', 'success');
            }
          }
        } catch (err) {
          console.error('Check AI evaluation status error:', err);
        }
      }, 1000); // 每1秒检查一次

      return () => clearInterval(interval);
    }
  }, [selectedSession?.sessionId, aiEvaluationStatus, fetchPendingSessions, fetchSessionDetail, showNotification]);

  // 改进7: 添加手动刷新按钮
  const handleManualRefresh = async () => {
    await fetchPendingSessions();
    if (selectedSession?.sessionId) {
      await fetchSessionDetail(selectedSession.sessionId);
    }
    showNotification('数据已刷新', 'success');
  };

  return (
    <div>
      {/* 添加刷新按钮 */}
      <button 
        onClick={handleManualRefresh}
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        🔄 刷新
      </button>
      
      {/* 显示AI评估状态 */}
      {aiEvaluationStatus === 'in_progress' && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-blue-800 text-sm">AI正在评估中，预计需要30-60秒...</span>
          </div>
        </div>
      )}
      
      {/* 其他组件内容 */}
    </div>
  );
}
