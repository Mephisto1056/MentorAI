'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { io, Socket } from 'socket.io-client';

export default function PracticeChat() {
  const searchParams = useSearchParams();
  const [taskConfig, setTaskConfig] = useState<any>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [customerName, setCustomerName] = useState<string>('');
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化WebSocket连接
  useEffect(() => {
    const initializeSocket = () => {
      const socket = io('http://localhost:5000');
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from server');
        setIsConnected(false);
      });

      socket.on('new_message', (data) => {
        setMessages(prev => [...prev, {
          role: data.role === 'student' ? 'user' : 'ai',
          content: data.message,
          timestamp: new Date(data.timestamp)
        }]);
        setIsTyping(false);
      });

      socket.on('error', (error) => {
        console.error('Socket error:', error);
        alert('连接错误: ' + error.message);
        setIsTyping(false);
      });

      return socket;
    };

    const socket = initializeSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // 从URL参数中获取配置和prompt，并创建会话
  useEffect(() => {
    const configParam = searchParams.get('config');
    const promptParam = searchParams.get('prompt');
    
    if (configParam && promptParam) {
      try {
        const config = JSON.parse(decodeURIComponent(configParam));
        const prompt = decodeURIComponent(promptParam);
        setTaskConfig(config);
        setAiPrompt(prompt);
        
        // 创建新的练习会话
        createPracticeSession(config, prompt);
      } catch (error) {
        console.error('解析URL参数失败:', error);
      }
    }
  }, [searchParams]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateInitialMessage = (config: any) => {
    const name = getCustomerName(config);
    const profession = config.customerProfession || '客户';
    const taskGoal = config.taskGoal || '产品咨询';
    const interestedVehicle = config.interestedVehicle || '保时捷车型';
    const competitorInterested = config.competitorInterested || '其他品牌';
    
    const greetings = [
      `您好！我是${name}，一位${profession}。我最近在考虑购买${interestedVehicle}，听说这款车很不错。`,
      `你好，我叫${name}，从事${profession}工作。我对${interestedVehicle}很感兴趣，想了解一下详细信息。`,
      `您好！我是${name}，职业是${profession}。我在考虑${interestedVehicle}，不过也在看${competitorInterested}，想对比一下。`
    ];
    
    return greetings[Math.floor(Math.random() * greetings.length)];
  };

  // 使用确定性的名称生成，避免水合错误
  const getCustomerName = (config: any) => {
    if (customerName) {
      return customerName;
    }
    
    const maleNames = ['李先生', '王先生', '张先生', '刘先生', '陈先生'];
    const femaleNames = ['李女士', '王女士', '张女士', '刘女士', '陈女士'];
    
    // 基于配置生成确定性的索引
    const profession = config?.customerProfession || '';
    const age = config?.customerAge || '';
    const seed = profession.length + age.length;
    
    let name = '';
    if (config?.customerGender === '男') {
      name = maleNames[seed % maleNames.length];
    } else if (config?.customerGender === '女') {
      name = femaleNames[seed % femaleNames.length];
    } else {
      const allNames = [...maleNames, ...femaleNames];
      name = allNames[seed % allNames.length];
    }
    
    // 设置客户名称状态，确保一致性
    if (!customerName && name) {
      setCustomerName(name);
    }
    
    return name;
  };

  // 创建练习会话
  const createPracticeSession = async (config: any, prompt: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskConfig: config,
          aiPrompt: prompt,
          customerProfile: {
            name: getCustomerName(config),
            profession: config.customerProfession,
            personality: config.customerPersonality,
            communicationStyle: config.customerCommunication,
            interests: config.customerHobbies,
            gender: config.customerGender,
            age: config.customerAge
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        const sessionId = result.data?._id || result._id;
        setSessionId(sessionId);
        console.log('Session created successfully:', sessionId);
        
        // 加入WebSocket房间
        if (socketRef.current && sessionId) {
          socketRef.current.emit('join_session', {
            sessionId: sessionId,
            userId: 'demo-user' // 临时用户ID，实际应该从认证中获取
          });
        }

        // 生成初始AI消息
        const initialMessage = generateInitialMessage(config);
        setMessages([{
          role: 'ai',
          content: initialMessage,
          timestamp: new Date()
        }]);
      } else {
        console.error('Failed to create session, response:', response.status);
        // 创建一个模拟的会话ID用于本地模式
        const mockSessionId = 'mock-session-' + Date.now();
        setSessionId(mockSessionId);
        console.log('Using mock session ID:', mockSessionId);
        
        const initialMessage = generateInitialMessage(config);
        setMessages([{
          role: 'ai',
          content: initialMessage,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error creating session:', error);
      // 创建一个模拟的会话ID用于本地模式
      const mockSessionId = 'mock-session-' + Date.now();
      setSessionId(mockSessionId);
      console.log('Using mock session ID due to error:', mockSessionId);
      
      const initialMessage = generateInitialMessage(config);
      setMessages([{
        role: 'ai',
        content: initialMessage,
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() && socketRef.current && sessionId && !sessionId.startsWith('mock-session-')) {
      // WebSocket模式：发送到后端，不在本地立即添加消息
      const messageContent = inputMessage;
      setInputMessage('');
      setIsTyping(true);
      
      // 发送消息到后端
      socketRef.current.emit('send_message', {
        sessionId,
        message: messageContent,
        userId: 'demo-user' // 临时用户ID
      });
      
      // 请求AI回复
      setTimeout(() => {
        if (socketRef.current && sessionId) {
          socketRef.current.emit('request_ai_response', {
            sessionId,
            userId: 'demo-user'
          });
        }
      }, 500);
    } else if (inputMessage.trim()) {
      // 降级模式：本地模拟（包括模拟会话ID的情况）
      const newMessage = {
        role: 'user',
        content: inputMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputMessage('');
      setIsTyping(true);
      
      // 使用阿里云API生成回复
      generateAIResponse(inputMessage);
    }
  };

  // 直接调用阿里云API生成回复（降级模式）
  const generateAIResponse = async (userMessage: string) => {
    try {
      const response = await fetch('http://localhost:5000/api/ai/generate-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          taskConfig: taskConfig,
          aiPrompt: aiPrompt,
          conversationHistory: messages
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, {
          role: 'ai',
          content: data.response,
          timestamp: new Date()
        }]);
      } else {
        // 如果API调用失败，使用预设回复
        const fallbackResponses = [
          '嗯，您说的很有道理。我想了解更多关于这款车的信息。',
          '这个配置听起来不错。价格方面怎么样呢？',
          '我需要考虑一下。还有其他需要了解的吗？'
        ];
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        setMessages(prev => [...prev, {
          role: 'ai',
          content: randomResponse,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('AI response error:', error);
      // 错误处理：使用预设回复
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '抱歉，我需要一点时间思考。请继续介绍您的产品。',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const submitForEvaluation = async () => {
    if (!sessionId) {
      alert('会话未创建，无法提交评估。请先进行对话练习。');
      return;
    }

    // 检查是否有足够的对话内容
    if (messages.length < 3) {
      alert('请至少进行几轮对话后再提交评估。');
      return;
    }

    try {
      // 显示提交中状态
      const submitButton = document.querySelector('[data-submit-btn]') as HTMLButtonElement;
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = '提交中...';
      }

      // 如果是模拟会话ID，创建一个真实的会话用于评估
      if (sessionId.startsWith('mock-session-')) {
        console.log('Creating real session for evaluation...');
        
        // 创建真实会话
        const createResponse = await fetch('http://localhost:5000/api/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskConfig: taskConfig,
            aiPrompt: aiPrompt,
            customerProfile: {
              name: getCustomerName(taskConfig || {}),
              profession: taskConfig?.customerProfession,
              personality: taskConfig?.customerPersonality,
              communicationStyle: taskConfig?.customerCommunication,
              interests: taskConfig?.customerHobbies,
              gender: taskConfig?.customerGender,
              age: taskConfig?.customerAge
            },
            sessionName: `练习会话 ${new Date().toLocaleString('zh-CN')}`
          })
        });

        if (createResponse.ok) {
          const createResult = await createResponse.json();
          const realSessionId = createResult.data?._id || createResult._id;
          
          // 将对话记录添加到真实会话中
          for (const message of messages) {
            try {
              await fetch(`http://localhost:5000/api/sessions/${realSessionId}/messages`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  role: message.role === 'user' ? 'student' : 'ai_customer',
                  message: message.content
                })
              });
            } catch (msgError) {
              console.warn('Failed to add message:', msgError);
            }
          }
          
          // 更新sessionId为真实ID
          setSessionId(realSessionId);
          
          // 提交真实会话
          const submitResponse = await fetch(`http://localhost:5000/api/sessions/${realSessionId}/submit`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (submitResponse.ok) {
            // 跳转到评估结果页面
            window.location.href = `/evaluation-result?sessionId=${realSessionId}`;
            return;
          } else {
            throw new Error('Failed to submit real session');
          }
        } else {
          throw new Error('Failed to create real session');
        }
      } else {
        // 正常提交已存在的会话
        const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const result = await response.json();
          // 跳转到评估结果页面
          window.location.href = `/evaluation-result?sessionId=${sessionId}`;
        } else {
          const errorData = await response.json();
          alert('提交失败: ' + (errorData.error || '未知错误'));
          
          // 恢复按钮状态
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = '提交评估';
          }
        }
      }
    } catch (error: any) {
      console.error('Submit evaluation error:', error);
      alert('提交评估时发生错误，请稍后重试。错误信息: ' + (error?.message || '未知错误'));
      
      // 恢复按钮状态
      const submitButton = document.querySelector('[data-submit-btn]') as HTMLButtonElement;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = '提交评估';
      }
    }
  };

  const restartSession = () => {
    setMessages([
      { 
        role: 'ai', 
        content: '您好！我是李先生，一位金融分析师。我最近在考虑购买一辆保时捷991-2，听说这款车的性能很不错。不过我也在看小米SU7，想了解一下两者的区别。',
        timestamp: new Date()
      }
    ]);
    setInputMessage('');
    setIsTyping(false);
  };

  const getSessionDuration = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - sessionStartTime.getTime()) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}分${seconds}秒`;
  };

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
              <span className="ml-2 text-sm text-gray-500">学员对话界面</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/task-generator" className="text-sm text-gray-600 hover:text-blue-600">
                任务生成
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600">
                数据面板
              </Link>
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">S</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">学员对话界面</h2>
            <div className="flex space-x-2">
              <button 
                onClick={restartSession}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                重新开始
              </button>
              <button 
                onClick={submitForEvaluation}
                data-submit-btn
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                提交评估
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 对话区域 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">模拟对话</h3>
                      <p className="text-sm text-gray-500">
                        任务：{taskConfig?.taskGoal || '991-2产品介绍'} | 
                        方法论：{taskConfig?.methodology || 'FAB产品介绍技巧'} | 
                        客户：{getCustomerName(taskConfig || {})}（{taskConfig?.customerProfession || '金融分析师'}）
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      对话时长: {getSessionDuration()}
                    </div>
                  </div>
                </div>
                
                <div className="h-96 overflow-y-auto p-6 space-y-4">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="输入您的回复..."
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isTyping}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isTyping}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      发送
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 侧边栏信息 */}
            <div className="space-y-4">
              {/* 客户信息 */}
              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">客户信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">姓名：</span>{getCustomerName(taskConfig || {})}</div>
                  <div><span className="font-medium">职业：</span>{taskConfig?.customerProfession || '金融分析师'}</div>
                  <div><span className="font-medium">年龄：</span>{taskConfig?.customerAge || '35岁'}</div>
                  <div><span className="font-medium">性格：</span>{taskConfig?.customerPersonality?.join('、') || '理性、数据导向'}</div>
                  <div><span className="font-medium">沟通方式：</span>{taskConfig?.customerCommunication || 'D控制型'}</div>
                  <div><span className="font-medium">关注点：</span>{taskConfig?.customerFocus?.join('、') || '动力、智能化、残值'}</div>
                  <div><span className="font-medium">竞品考虑：</span>{taskConfig?.competitorInterested || '小米SU7'}</div>
                  <div><span className="font-medium">意向车型：</span>{taskConfig?.interestedVehicle || 'Taycan J2'}</div>
                  {taskConfig?.customerHobbies?.length > 0 && (
                    <div><span className="font-medium">兴趣爱好：</span>{taskConfig.customerHobbies.join('、')}</div>
                  )}
                </div>
              </div>

              {/* 实时提示 */}
              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">实时提示</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-yellow-50 border-l-4 border-yellow-400">
                    <p className="text-yellow-800">💡 客户关注残值率，可以重点介绍保时捷的保值性</p>
                  </div>
                  <div className="p-2 bg-blue-50 border-l-4 border-blue-400">
                    <p className="text-blue-800">📊 使用FAB技巧：特征→优势→利益</p>
                  </div>
                  <div className="p-2 bg-green-50 border-l-4 border-green-400">
                    <p className="text-green-800">✅ 已识别客户D型性格，保持直接高效的沟通</p>
                  </div>
                  <div className="p-2 bg-purple-50 border-l-4 border-purple-400">
                    <p className="text-purple-800">🎯 建议询问客户具体用车场景</p>
                  </div>
                </div>
              </div>

              {/* 评估标准 */}
              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">评估标准</h4>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium text-blue-900">沟通维度 (25%)</p>
                    <p className="text-gray-600">匹配客户沟通方式、引导沟通方向</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium text-green-900">本品维度 (25%)</p>
                    <p className="text-gray-600">产品知识正确、突出配置优势</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium text-orange-900">竞品维度 (25%)</p>
                    <p className="text-gray-600">了解竞品知识、客观对比分析</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium text-purple-900">客户信息获取 (15%)</p>
                    <p className="text-gray-600">了解兴趣爱好、职业背景</p>
                  </div>
                  <div className="p-2 bg-gray-50 rounded">
                    <p className="font-medium text-red-900">方法论匹配 (10%)</p>
                    <p className="text-gray-600">清晰运用FAB销售技巧</p>
                  </div>
                </div>
              </div>

              {/* 快速回复 */}
              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">快速回复</h4>
                <div className="space-y-2">
                  {[
                    '您对动力性能有什么具体要求吗？',
                    '我来为您详细介绍一下991-2的配置优势',
                    '相比小米SU7，保时捷在品牌价值方面...',
                    '您平时主要在什么场景下用车？',
                    '我们现在有很好的金融政策...'
                  ].map((quickReply, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(quickReply)}
                      className="w-full text-left p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded border"
                    >
                      {quickReply}
                    </button>
                  ))}
                </div>
              </div>

              {/* 对话统计 */}
              <div className="bg-white rounded-lg shadow p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">对话统计</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>消息数量：</span>
                    <span className="font-medium">{messages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>我的回复：</span>
                    <span className="font-medium">{messages.filter(m => m.role === 'user').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>客户回复：</span>
                    <span className="font-medium">{messages.filter(m => m.role === 'ai').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>平均响应时间：</span>
                    <span className="font-medium">12秒</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
