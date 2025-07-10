'use client';

import React, { useState, useEffect } from 'react';

interface VoiceSettings {
  enableVoice: boolean;
  autoPlay: boolean;
  volume: number;
  speed: number;
}

interface VoiceControllerProps {
  settings: VoiceSettings;
  onSettingsChange: (settings: VoiceSettings) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
}

export default function VoiceController({ 
  settings, 
  onSettingsChange, 
  isPlaying = false, 
  onTogglePlay 
}: VoiceControllerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSettingChange = (key: keyof VoiceSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* 语音控制头部 */}
      <div 
        className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${settings.enableVoice ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <h4 className="text-sm font-medium text-gray-900">语音控制</h4>
          {isPlaying && (
            <div className="flex items-center space-x-1">
              <div className="w-1 h-3 bg-blue-500 animate-pulse"></div>
              <div className="w-1 h-4 bg-blue-500 animate-pulse" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 h-2 bg-blue-500 animate-pulse" style={{animationDelay: '0.2s'}}></div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {/* 快速播放控制 */}
          {settings.enableVoice && onTogglePlay && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              className={`p-2 rounded-full ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'} hover:bg-opacity-80`}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}
          
          <svg 
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 语音设置面板 */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
          {/* 启用语音开关 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">启用语音</label>
            <button
              onClick={() => handleSettingChange('enableVoice', !settings.enableVoice)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enableVoice ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enableVoice ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {settings.enableVoice && (
            <>
              {/* 自动播放开关 */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">自动播放</label>
                <button
                  onClick={() => handleSettingChange('autoPlay', !settings.autoPlay)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.autoPlay ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.autoPlay ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 音量控制 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">音量</label>
                  <span className="text-sm text-gray-500">{Math.round(settings.volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => handleSettingChange('volume', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* 语速控制 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">语速</label>
                  <span className="text-sm text-gray-500">{settings.speed}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.speed}
                  onChange={(e) => handleSettingChange('speed', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              {/* 语音状态指示 */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>语音状态</span>
                  <span className={`px-2 py-1 rounded-full ${
                    isPlaying ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {isPlaying ? '播放中' : '待机'}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
