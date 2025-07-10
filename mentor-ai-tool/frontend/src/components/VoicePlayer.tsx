'use client';

import React, { useState, useRef, useEffect } from 'react';

interface VoiceData {
  success: boolean;
  audioData?: string;
  format?: string;
  fallback?: boolean;
  text?: string;
  error?: string;
  source?: string;
  voiceProfile?: {
    voice: string;
    voiceDescription: string;
    speed: number;
    emotion: string;
    styleDescription: string;
    customerProfile: {
      gender: string;
      age: number;
      ageGroup: string;
      personality: string;
    };
  };
}

interface VoicePlayerProps {
  voiceData: VoiceData | null;
  text: string;
  autoPlay?: boolean;
  volume?: number;
  speed?: number;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  onError?: (error: string) => void;
}

export default function VoicePlayer({
  voiceData,
  text,
  autoPlay = false,
  volume = 0.8,
  speed = 1.0,
  onPlayStart,
  onPlayEnd,
  onError
}: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // 清理函数
  const cleanup = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (speechSynthesisRef.current) {
      speechSynthesis.cancel();
    }
    
    setIsPlaying(false);
    setCurrentTime(0);
    setIsLoading(false);
  };

  useEffect(() => {
    return cleanup;
  }, []);

  // 当语音数据变化时，自动播放
  useEffect(() => {
    if (voiceData && autoPlay) {
      playVoice();
    }
  }, [voiceData, autoPlay]);

  // 播放语音
  const playVoice = async () => {
    if (isPlaying) {
      stopVoice();
      return;
    }

    if (!text) {
      onError?.('没有可播放的语音内容');
      return;
    }

    setIsLoading(true);
    onPlayStart?.();

    try {
      // 如果有服务器生成的音频数据
      if (voiceData && voiceData.success && voiceData.audioData) {
        await playServerAudio(voiceData.audioData, voiceData.format || 'mp3');
      } 
      // 降级到浏览器TTS
      else {
        await playBrowserTTS(text);
      }
    } catch (error) {
      console.error('Voice playback error:', error);
      onError?.('语音播放失败');
      setIsPlaying(false);
      onPlayEnd?.();
    } finally {
      setIsLoading(false);
    }
  };

  // 播放服务器生成的音频
  const playServerAudio = async (audioData: string, format: string) => {
    try {
      // 创建音频Blob
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: `audio/${format}` });
      const audioUrl = URL.createObjectURL(blob);
      
      // 创建音频元素
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.volume = volume;
      audio.playbackRate = speed;
      
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };
      
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      audio.onplay = () => {
        setIsPlaying(true);
      };
      
      audio.onpause = () => {
        setIsPlaying(false);
      };
      
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        onPlayEnd?.();
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        throw new Error('Audio playback failed');
      };
      
      await audio.play();
    } catch (error) {
      console.error('Server audio playback error:', error);
      // 降级到浏览器TTS
      await playBrowserTTS(text);
    }
  };

  // 使用浏览器TTS播放
  const playBrowserTTS = async (textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      throw new Error('浏览器不支持语音合成');
    }

    return new Promise<void>((resolve, reject) => {
      speechSynthesis.cancel(); // 取消之前的语音
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      speechSynthesisRef.current = utterance;
      
      // 设置语音参数
      utterance.lang = 'zh-CN';
      utterance.volume = volume;
      utterance.rate = speed;
      utterance.pitch = 1;
      
      // 尝试选择中文语音
      const voices = speechSynthesis.getVoices();
      const chineseVoice = voices.find(voice => 
        voice.lang.includes('zh') || voice.lang.includes('CN')
      );
      if (chineseVoice) {
        utterance.voice = chineseVoice;
      }
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setDuration(textToSpeak.length * 0.1); // 估算时长
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        onPlayEnd?.();
        resolve();
      };
      
      utterance.onerror = (event) => {
        setIsPlaying(false);
        onPlayEnd?.();
        reject(new Error(`TTS error: ${event.error}`));
      };
      
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        if (!speechSynthesis.speaking) {
          clearInterval(progressInterval);
          return;
        }
        setCurrentTime(prev => Math.min(prev + 0.1, duration));
      }, 100);
      
      speechSynthesis.speak(utterance);
    });
  };

  // 停止播放
  const stopVoice = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    if (speechSynthesisRef.current) {
      speechSynthesis.cancel();
    }
    
    setIsPlaying(false);
    setCurrentTime(0);
    onPlayEnd?.();
  };

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // 进度条点击处理
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
      {/* 播放/停止按钮 */}
      <button
        onClick={playVoice}
        disabled={isLoading || !text}
        className={`p-2 rounded-full transition-colors ${
          isLoading || !text
            ? 'bg-gray-200 cursor-not-allowed'
            : isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isLoading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : isPlaying ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* 进度条 */}
      <div className="flex-1 space-y-1">
        <div 
          className="h-2 bg-gray-200 rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-blue-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* 时间显示 */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* 语音来源指示 */}
      <div className="text-xs text-gray-500">
        {voiceData?.success && voiceData.audioData ? (
          <div className="space-y-1">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
              {voiceData.source === 'CosyVoice' ? 'CosyVoice' : 'AI语音'}
            </span>
            {voiceData.voiceProfile && (
              <div className="text-xs text-gray-400">
                {voiceData.voiceProfile.voiceDescription}
              </div>
            )}
          </div>
        ) : (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">浏览器TTS</span>
        )}
      </div>
    </div>
  );
}
