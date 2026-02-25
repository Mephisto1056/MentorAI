// 自动检测API基础URL
const getBaseUrl = (): string => {
  // 如果设置了环境变量，优先使用环境变量
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  
  // 在浏览器环境中，自动检测当前域名和协议
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // 如果是localhost，使用6100端口（本地开发）
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const protocol = window.location.protocol;
      return `${protocol}//localhost:6100`;
    }

    // 非localhost：前后端由同一Express托管，使用同源请求
    return '';
  }

  // 服务端渲染时的默认值
  return 'http://localhost:6100';
};

// API配置
export const API_CONFIG = {
  // 自动检测API基础URL
  BASE_URL: getBaseUrl(),
  
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
