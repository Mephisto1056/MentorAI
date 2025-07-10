'use client';

import React, { useState, useRef, useEffect } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function VoiceInput({ 
  onTranscript, 
  onError, 
  disabled = false, 
  placeholder = "点击录音或按住说话" 
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [recordingMode, setRecordingMode] = useState<'click' | 'hold'>('click');
  
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 检查浏览器是否支持语音识别
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'zh-CN';
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);
        
        // 如果有最终结果，调用回调
        if (finalTranscript) {
          onTranscript(finalTranscript.trim());
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        
        let errorMessage = '语音识别出错';
        switch (event.error) {
          case 'no-speech':
            errorMessage = '未检测到语音，请重试';
            break;
          case 'audio-capture':
            errorMessage = '无法访问麦克风';
            break;
          case 'not-allowed':
            errorMessage = '麦克风权限被拒绝';
            break;
          case 'network':
            errorMessage = '网络错误，请检查连接';
            break;
        }
        
        onError?.(errorMessage);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      onError?.('浏览器不支持语音识别功能');
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onTranscript, onError]);

  const startRecording = () => {
    if (!isSupported || disabled || !recognitionRef.current) return;
    
    try {
      setTranscript('');
      recognitionRef.current.start();
      
      // 设置超时，防止长时间录音
      timeoutRef.current = setTimeout(() => {
        stopRecording();
      }, 30000); // 30秒超时
    } catch (error) {
      console.error('Failed to start recording:', error);
      onError?.('启动录音失败');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleClick = () => {
    if (recordingMode === 'click') {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  };

  const handleMouseDown = () => {
    if (recordingMode === 'hold') {
      startRecording();
    }
  };

  const handleMouseUp = () => {
    if (recordingMode === 'hold') {
      stopRecording();
    }
  };

  const handleTouchStart = () => {
    if (recordingMode === 'hold') {
      startRecording();
    }
  };

  const handleTouchEnd = () => {
    if (recordingMode === 'hold') {
      stopRecording();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-sm text-yellow-800">浏览器不支持语音识别</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 录音模式切换 */}
      <div className="flex items-center space-x-4 text-sm">
        <span className="text-gray-600">录音模式:</span>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="click"
            checked={recordingMode === 'click'}
            onChange={(e) => setRecordingMode(e.target.value as 'click' | 'hold')}
            className="text-blue-600"
          />
          <span>点击录音</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="radio"
            value="hold"
            checked={recordingMode === 'hold'}
            onChange={(e) => setRecordingMode(e.target.value as 'click' | 'hold')}
            className="text-blue-600"
          />
          <span>按住说话</span>
        </label>
      </div>

      {/* 录音按钮 */}
      <div className="flex items-center space-x-3">
        <button
          onClick={handleClick}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          disabled={disabled}
          className={`relative p-4 rounded-full transition-all duration-200 ${
            disabled 
              ? 'bg-gray-200 cursor-not-allowed' 
              : isRecording 
                ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-lg' 
                : 'bg-blue-500 hover:bg-blue-600 shadow-md'
          }`}
        >
          {isRecording ? (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
          
          {/* 录音动画效果 */}
          {isRecording && (
            <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
          )}
        </button>

        <div className="flex-1">
          {/* 实时转录显示 */}
          <div className={`min-h-[2.5rem] p-3 border rounded-lg transition-colors ${
            isRecording ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50'
          }`}>
            {transcript ? (
              <p className="text-sm text-gray-900">{transcript}</p>
            ) : (
              <p className="text-sm text-gray-500">
                {isRecording ? '正在录音...' : placeholder}
              </p>
            )}
          </div>

          {/* 录音状态指示 */}
          {isRecording && (
            <div className="mt-2 flex items-center space-x-2 text-xs text-red-600">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span>录音中 - {recordingMode === 'click' ? '再次点击停止' : '松开停止'}</span>
            </div>
          )}
        </div>
      </div>

      {/* 使用提示 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 提示：</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>首次使用需要授权麦克风权限</li>
          <li>说话清晰，避免环境噪音</li>
          <li>支持中文普通话识别</li>
          <li>录音会自动在30秒后停止</li>
        </ul>
      </div>
    </div>
  );
}
