'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { io, Socket } from 'socket.io-client';
import VoiceController from '../../components/VoiceController';
import VoiceInput from '../../components/VoiceInput';
import VoicePlayer from '../../components/VoicePlayer';
import { getApiUrl, SOCKET_CONFIG } from '../../config';

export default function PracticeChat() {
  const [searchParamsReady, setSearchParamsReady] = useState(false);
  const [configParam, setConfigParam] = useState<string | null>(null);
  const [promptParam, setPromptParam] = useState<string | null>(null);
  const [taskConfig, setTaskConfig] = useState<any>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [customerName, setCustomerName] = useState<string>('');
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  
  // 语音功能状态
  const [voiceSettings, setVoiceSettings] = useState({
    enableVoice: true,
    autoPlay: true,
    volume: 0.8,
    speed: 1.0
  });
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [showVoiceInput, setShowVoiceInput] = useState(false);
  
  // 可展开/收起状态
  const [isCustomerInfoExpanded, setIsCustomerInfoExpanded] = useState(true);
  const [isRealTimeTipsExpanded, setIsRealTimeTipsExpanded] = useState(true);
  const [isEvaluationCriteriaExpanded, setIsEvaluationCriteriaExpanded] = useState(true);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化WebSocket连接
  useEffect(() => {
    const initializeSocket = () => {
      const socket = io(SOCKET_CONFIG.URL, SOCKET_CONFIG.OPTIONS);
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

  // 客户端读取 URL 参数
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setConfigParam(params.get('config'));
    setPromptParam(params.get('prompt'));
    setSearchParamsReady(true);
  }, []);

  // 从URL参数中获取配置和prompt，并创建会话
  useEffect(() => {
    if (!searchParamsReady) return;
    
    // 重置客户姓名，确保使用新配置生成
    setCustomerName('');
    
    if (configParam) {
      try {
        // 安全地解码配置参数
        let config;
        try {
          config = JSON.parse(decodeURIComponent(configParam));
        } catch (decodeError) {
          console.warn('配置参数解码失败，尝试直接解析:', decodeError);
          try {
            config = JSON.parse(configParam);
          } catch (parseError) {
            console.error('配置参数解析完全失败:', parseError);
            throw parseError;
          }
        }
        
        // 安全地解码prompt参数
        let prompt = '';
        if (promptParam) {
          try {
            prompt = decodeURIComponent(promptParam);
          } catch (decodeError) {
            console.warn('Prompt参数解码失败，使用原始值:', decodeError);
            prompt = promptParam;
          }
        }
        
        console.log('成功解析配置:', config);
        console.log('成功解析prompt:', prompt.substring(0, 100) + '...');
        
        setTaskConfig(config);
        setAiPrompt(prompt);
        
        // 创建新的练习会话
        createPracticeSession(config, prompt);
      } catch (error) {
        console.error('解析URL参数失败:', error);
        // 如果解析失败，使用默认配置
        const defaultConfig = {
          taskGoal: '991-2产品介绍',
          methodology: 'FAB产品介绍技巧',
          customerProfession: '金融分析师',
          customerAge: '35岁',
          customerGender: '男',
          customerPersonality: ['理性', '数据导向'],
          customerCommunication: 'D控制型',
          customerFocus: ['动力', '智能化', '残值'],
          competitorInterested: '小米SU7',
          interestedVehicle: 'Taycan J2'
        };
        setTaskConfig(defaultConfig);
        setAiPrompt('你是一位对保时捷感兴趣的客户，请根据配置信息进行角色扮演。');
        createPracticeSession(defaultConfig, '你是一位对保时捷感兴趣的客户，请根据配置信息进行角色扮演。');
      }
    } else {
      // 如果没有配置参数，使用默认配置
      const defaultConfig = {
        taskGoal: '991-2产品介绍',
        methodology: 'FAB产品介绍技巧',
        customerProfession: '金融分析师',
        customerAge: '35岁',
        customerGender: '男',
        customerPersonality: ['理性', '数据导向'],
        customerCommunication: 'D控制型',
        customerFocus: ['动力', '智能化', '残值'],
        competitorInterested: '小米SU7',
        interestedVehicle: 'Taycan J2'
      };
      setTaskConfig(defaultConfig);
      setAiPrompt('你是一位对保时捷感兴趣的客户，请根据配置信息进行角色扮演。');
      createPracticeSession(defaultConfig, '你是一位对保时捷感兴趣的客户，请根据配置信息进行角色扮演。');
    }
  }, [searchParamsReady, configParam, promptParam]);

  // 自动滚动到底部 - 只滚动对话框内部，不滚动整个页面
  useEffect(() => {
    if (shouldAutoScroll && messages.length > 0) {
      // 只在最后一条消息是AI回复时才自动滚动
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'ai') {
        // 获取对话框容器并滚动到底部
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) {
          chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [messages, shouldAutoScroll]);

  const generateInitialMessage = (config: any) => {
    const name = getCustomerName(config);
    
    // 更自然的开场白，不暴露太多信息
    const naturalGreetings = [
      `您好！我想了解一下保时捷的车型。`,
      `你好，我对保时捷比较感兴趣，能介绍一下吗？`,
      `您好！听朋友说保时捷不错，想来看看。`,
      `你好，我想了解一下你们的产品。`,
      `您好！我路过看到展厅，想进来了解一下。`,
      `你好，我对豪华车比较感兴趣，能给我介绍介绍吗？`
    ];
    
    return naturalGreetings[Math.floor(Math.random() * naturalGreetings.length)];
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
    if (config?.customerGender === '女') {
      // 明确是女性，使用女士称谓
      name = femaleNames[seed % femaleNames.length];
    } else {
      // 默认使用男士称谓（包括明确是男性或未指定性别的情况）
      name = maleNames[seed % maleNames.length];
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
      const response = await fetch(getApiUrl('/api/sessions'), {
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
        console.warn('会话创建失败，切换到本地模式，状态码:', response.status);
        // 创建一个模拟的会话ID用于本地模式
        const mockSessionId = 'mock-session-' + Date.now();
        setSessionId(mockSessionId);
        console.log('使用本地模拟会话ID:', mockSessionId);
        
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
      setShouldAutoScroll(false); // 用户发送消息时不自动滚动
      
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
          setShouldAutoScroll(true); // AI回复时恢复自动滚动
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
      setShouldAutoScroll(false); // 用户发送消息时不自动滚动
      
      // 使用阿里云API生成回复
      generateAIResponse(inputMessage);
    }
  };

  // 生成AI语音响应（支持语音功能）
  const generateAIVoiceResponse = async (userMessage: string) => {
    try {
      console.log('生成AI响应，使用的配置:', taskConfig);
      console.log('生成AI响应，使用的prompt:', aiPrompt?.substring(0, 200) + '...');
      
      // 始终使用语音响应API，让后端决定是否生成语音
      const response = await fetch(getApiUrl('/api/ai/generate-voice-response'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          taskConfig: taskConfig,
          aiPrompt: aiPrompt,
          conversationHistory: messages,
          enableVoice: voiceSettings.enableVoice
        })
      });

      console.log('API响应状态:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API响应数据:', data);
        
        if (data.success && data.data && data.data.text) {
          // 成功获取AI响应
          setMessages(prev => [...prev, {
            role: 'ai',
            content: data.data.text,
            timestamp: data.data.timestamp ? new Date(data.data.timestamp) : new Date(),
            voice: data.data.voice,
            voiceProfile: data.data.voiceProfile
          }]);
          console.log('AI响应添加成功:', data.data.text.substring(0, 100));
        } else {
          console.error('API响应格式错误:', data);
          // 使用智能回复而不是固定回复
          const contextualResponse = generateContextualResponse(userMessage, taskConfig);
          setMessages(prev => [...prev, {
            role: 'ai',
            content: contextualResponse,
            timestamp: new Date()
          }]);
        }
      } else {
        console.error('API调用失败，状态码:', response.status);
        const errorText = await response.text();
        console.error('错误详情:', errorText);
        
        // 使用智能回复而不是固定回复
        const contextualResponse = generateContextualResponse(userMessage, taskConfig);
        setMessages(prev => [...prev, {
          role: 'ai',
          content: contextualResponse,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('AI response error:', error);
      // 使用智能回复而不是固定回复
      const contextualResponse = generateContextualResponse(userMessage, taskConfig);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: contextualResponse,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
      setShouldAutoScroll(true); // AI回复完成后恢复自动滚动
    }
  };

  // 生成基于上下文的智能回复
  const generateContextualResponse = (userMessage: string, config: any) => {
    const customerName = getCustomerName(config || {});
    const profession = config?.customerProfession || '客户';
    const focusPoints = config?.customerFocus || ['产品信息'];
    const interestedVehicle = config?.interestedVehicle || '保时捷车型';
    
    // 根据用户消息内容生成相应回复
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('价格') || lowerMessage.includes('多少钱') || lowerMessage.includes('费用')) {
      return `作为${profession}，我对价格还是比较敏感的。${interestedVehicle}的价格区间大概是多少？有什么金融方案吗？`;
    }
    
    if (lowerMessage.includes('配置') || lowerMessage.includes('参数') || lowerMessage.includes('功能')) {
      return `我比较关注${focusPoints[0] || '性能'}方面，能详细介绍一下${interestedVehicle}在这方面的配置吗？`;
    }
    
    if (lowerMessage.includes('试驾') || lowerMessage.includes('体验')) {
      return `听起来不错！我什么时候可以预约试驾？我想亲自感受一下${interestedVehicle}的驾驶体验。`;
    }
    
    if (lowerMessage.includes('保养') || lowerMessage.includes('维修') || lowerMessage.includes('服务')) {
      return `保时捷的售后服务怎么样？保养费用大概是什么水平？`;
    }
    
    if (lowerMessage.includes('竞品') || lowerMessage.includes('对比') || lowerMessage.includes('比较')) {
      const competitor = config?.competitorInterested || '其他品牌';
      return `我之前也看过${competitor}，相比之下保时捷有什么独特的优势吗？`;
    }
    
    // 默认回复，但更加个性化
    const responses = [
      `作为${profession}，我想了解更多关于${interestedVehicle}的详细信息。`,
      `这个介绍很有意思，能再详细说说${focusPoints[0] || '产品特点'}吗？`,
      `听起来不错，不过我还需要考虑一些实际因素。`,
      `我对保时捷品牌一直很感兴趣，这款车的核心卖点是什么？`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // 直接调用阿里云API生成回复（降级模式）
  const generateAIResponse = async (userMessage: string) => {
    return generateAIVoiceResponse(userMessage);
  };

  // 语音输入处理
  const handleVoiceTranscript = (transcript: string) => {
    setInputMessage(transcript);
  };

  // 语音输入错误处理
  const handleVoiceError = (error: string) => {
    console.error('Voice input error:', error);
    // 可以显示错误提示
  };

  // 语音播放控制
  const handleVoicePlayStart = () => {
    setIsVoicePlaying(true);
  };

  const handleVoicePlayEnd = () => {
    setIsVoicePlaying(false);
  };

  // 语音播放错误处理
  const handleVoicePlayError = (error: string) => {
    console.error('Voice play error:', error);
    setIsVoicePlaying(false);
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
        const createResponse = await fetch(getApiUrl('/api/sessions'), {
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
              await fetch(getApiUrl(`/api/sessions/${realSessionId}/messages`), {
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
          const submitResponse = await fetch(getApiUrl(`/api/sessions/${realSessionId}/submit`), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (submitResponse.ok) {
            // 跳转到Mentor评估界面
            window.location.href = `/mentor-evaluation?sessionId=${realSessionId}`;
            return;
          } else {
            throw new Error('Failed to submit real session');
          }
        } else {
          throw new Error('Failed to create real session');
        }
      } else {
        // 正常提交已存在的会话
        const response = await fetch(getApiUrl(`/api/sessions/${sessionId}/submit`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const result = await response.json();
          // 跳转到Mentor评估界面
          window.location.href = `/mentor-evaluation?sessionId=${sessionId}`;
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
    // 重置客户姓名，确保使用当前配置重新生成
    setCustomerName('');
    
    // 使用当前配置重新生成初始消息，而不是硬编码
    const initialMessage = taskConfig ? generateInitialMessage(taskConfig) : '您好！我对您的产品很感兴趣，请为我介绍一下。';
    setMessages([
      { 
        role: 'ai', 
        content: initialMessage,
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
                AI Mentor工具
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
                    <div className="flex items-center space-x-4">
                      {/* 自动滚动控制开关 */}
                      <div className="flex items-center space-x-2">
                        <label className="text-xs text-gray-600">自动滚动</label>
                        <button
                          onClick={() => setShouldAutoScroll(!shouldAutoScroll)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            shouldAutoScroll ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                              shouldAutoScroll ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        对话时长: {getSessionDuration()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="h-96 overflow-y-auto p-6 space-y-4" id="chat-container">
                  {messages.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md space-y-2 ${
                        message.role === 'user' ? 'items-end' : 'items-start'
                      }`}>
                        <div className={`px-4 py-3 rounded-lg ${
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
                        
                        {/* AI消息的语音播放器 */}
                        {message.role === 'ai' && voiceSettings.enableVoice && (
                          <div className="w-full">
                            <VoicePlayer
                              voiceData={message.voice || null}
                              text={message.content}
                              autoPlay={voiceSettings.autoPlay}
                              volume={voiceSettings.volume}
                              speed={voiceSettings.speed}
                              onPlayStart={handleVoicePlayStart}
                              onPlayEnd={handleVoicePlayEnd}
                              onError={handleVoicePlayError}
                            />
                          </div>
                        )}
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
                
                {/* 快速回复 */}
                <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="mb-2">
                    <span className="text-xs font-medium text-gray-700">快速回复：</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {(() => {
                      // 根据任务配置动态生成快速回复
                      const baseReplies = [
                        '您平时主要在什么场景下用车？',
                        '我们现在有很好的金融政策...'
                      ];
                      
                      const taskGoal = taskConfig?.taskGoal || '991-2产品介绍';
                      const interestedVehicle = taskConfig?.interestedVehicle || '991-2';
                      const competitorInterested = taskConfig?.competitorInterested || '小米SU7';
                      const customerFocus = taskConfig?.customerFocus || ['动力'];
                      
                      const dynamicReplies = [
                        `您对${customerFocus[0] || '动力'}性能有什么具体要求吗？`,
                        `我来为您详细介绍一下${interestedVehicle}的配置优势`,
                        `相比${competitorInterested}，保时捷在品牌价值方面...`
                      ];
                      
                      return [...dynamicReplies, ...baseReplies];
                    })().map((quickReply, index) => (
                      <button
                        key={index}
                        onClick={() => setInputMessage(quickReply)}
                        className="px-3 py-1 text-xs bg-white hover:bg-blue-50 border border-gray-300 rounded-full transition-colors"
                      >
                        {quickReply}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200 space-y-3">
                  {/* 语音输入区域 */}
                  {showVoiceInput && (
                    <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                      <VoiceInput
                        onTranscript={handleVoiceTranscript}
                        onError={handleVoiceError}
                        disabled={isTyping}
                        placeholder="点击录音按钮开始语音输入"
                      />
                    </div>
                  )}
                  
                  {/* 文字输入区域 */}
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
                    
                    {/* 语音输入切换按钮 */}
                    <button
                      onClick={() => setShowVoiceInput(!showVoiceInput)}
                      className={`p-2 rounded-md transition-colors ${
                        showVoiceInput 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                      title={showVoiceInput ? '关闭语音输入' : '开启语音输入'}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                    </button>
                    
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
              {/* 语音控制 */}
              <VoiceController
                settings={voiceSettings}
                onSettingsChange={setVoiceSettings}
                isPlaying={isVoicePlaying}
                onTogglePlay={() => {
                  // 这里可以控制最新AI消息的语音播放
                  const lastAiMessage = messages.filter(m => m.role === 'ai').pop();
                  if (lastAiMessage?.voice) {
                    // 触发语音播放/停止
                  }
                }}
              />

              {/* 客户信息 */}
              <div className="bg-white rounded-lg shadow">
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50"
                  onClick={() => setIsCustomerInfoExpanded(!isCustomerInfoExpanded)}
                >
                  <h4 className="text-sm font-medium text-gray-900">客户信息</h4>
                  <svg 
                    className={`w-4 h-4 transition-transform ${isCustomerInfoExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {isCustomerInfoExpanded && (
                  <div className="px-4 pb-4 space-y-2 text-sm border-t border-gray-100">
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
                )}
              </div>

              {/* 实时提示 */}
              <div className="bg-white rounded-lg shadow">
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50"
                  onClick={() => setIsRealTimeTipsExpanded(!isRealTimeTipsExpanded)}
                >
                  <h4 className="text-sm font-medium text-gray-900">实时提示</h4>
                  <svg 
                    className={`w-4 h-4 transition-transform ${isRealTimeTipsExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {isRealTimeTipsExpanded && (
                  <div className="px-4 pb-4 space-y-2 text-sm border-t border-gray-100">
                    {(() => {
                      const tips = [];
                      const customerFocus = taskConfig?.customerFocus || [];
                      const methodology = taskConfig?.methodology || 'FAB产品介绍技巧';
                      const customerCommunication = taskConfig?.customerCommunication || 'D控制型';
                      const competitorInterested = taskConfig?.competitorInterested;
                      
                      // 根据客户关注点生成提示
                      if (customerFocus.includes('残值')) {
                        tips.push(
                          <div key="residual" className="p-2 bg-yellow-50 border-l-4 border-yellow-400">
                            <p className="text-yellow-800">💡 客户关注残值率，可以重点介绍保时捷的保值性</p>
                          </div>
                        );
                      }
                      if (customerFocus.includes('动力')) {
                        tips.push(
                          <div key="power" className="p-2 bg-red-50 border-l-4 border-red-400">
                            <p className="text-red-800">🚗 客户关注动力性能，可以详细介绍发动机参数和加速表现</p>
                          </div>
                        );
                      }
                      if (customerFocus.includes('智能化')) {
                        tips.push(
                          <div key="tech" className="p-2 bg-indigo-50 border-l-4 border-indigo-400">
                            <p className="text-indigo-800">📱 客户关注智能化配置，可以展示科技功能和互联体验</p>
                          </div>
                        );
                      }
                      
                      // 根据方法论生成提示
                      tips.push(
                        <div key="methodology" className="p-2 bg-blue-50 border-l-4 border-blue-400">
                          <p className="text-blue-800">📊 使用{methodology}：{methodology === 'FAB产品介绍技巧' ? '特征→优势→利益' : methodology === 'SPIN销售法' ? '情况→问题→影响→需求回报' : '系统化销售流程'}</p>
                        </div>
                      );
                      
                      // 根据沟通方式生成提示
                      const communicationTips: { [key: string]: string } = {
                        'D控制型': '已识别客户D型性格，保持直接高效的沟通',
                        'I影响型': '已识别客户I型性格，多用案例和故事进行沟通',
                        'C遵循型': '已识别客户C型性格，提供详细数据和逻辑分析',
                        'S稳定型': '已识别客户S型性格，保持耐心和稳定的沟通节奏'
                      };
                      
                      tips.push(
                        <div key="communication" className="p-2 bg-green-50 border-l-4 border-green-400">
                          <p className="text-green-800">✅ {communicationTips[customerCommunication] || '根据客户性格调整沟通方式'}</p>
                        </div>
                      );
                      
                      // 根据竞品生成提示
                      if (competitorInterested) {
                        tips.push(
                          <div key="competitor" className="p-2 bg-orange-50 border-l-4 border-orange-400">
                            <p className="text-orange-800">🔄 客户考虑{competitorInterested}，准备差异化对比分析</p>
                          </div>
                        );
                      }
                      
                      // 通用提示
                      tips.push(
                        <div key="general" className="p-2 bg-purple-50 border-l-4 border-purple-400">
                          <p className="text-purple-800">🎯 建议询问客户具体用车场景</p>
                        </div>
                      );
                      
                      return tips;
                    })()}
                  </div>
                )}
              </div>

              {/* 评估标准 */}
              <div className="bg-white rounded-lg shadow">
                <div 
                  className="p-4 cursor-pointer flex justify-between items-center hover:bg-gray-50"
                  onClick={() => setIsEvaluationCriteriaExpanded(!isEvaluationCriteriaExpanded)}
                >
                  <h4 className="text-sm font-medium text-gray-900">评估标准</h4>
                  <svg 
                    className={`w-4 h-4 transition-transform ${isEvaluationCriteriaExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {isEvaluationCriteriaExpanded && (
                  <div className="px-4 pb-4 space-y-2 text-xs border-t border-gray-100">
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
                )}
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
