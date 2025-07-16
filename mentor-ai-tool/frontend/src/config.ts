// API配置
export const API_CONFIG = {
  // 从环境变量获取API基础URL，如果没有则使用默认值
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:6100',
  
  // API端点
  ENDPOINTS: {
    SESSIONS: '/api/sessions',
    AI: '/api/ai',
    EVALUATIONS: '/api/evaluations',
    CUSTOMER_TYPES: '/api/customer-types',
    VOICE: '/api/voice'
  }
};

// 获取完整的API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Socket.IO配置
export const SOCKET_CONFIG = {
  URL: API_CONFIG.BASE_URL,
  OPTIONS: {
    transports: ['websocket', 'polling'],
    timeout: 20000,
    forceNew: true
  }
};
