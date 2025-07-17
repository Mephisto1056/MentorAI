const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/database');
const logger = require('./utils/logger');

// Import routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const sessionRoutes = require('./routes/sessions');
const evaluationRoutes = require('./routes/evaluations');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const customerTypesRoutes = require('./routes/customerTypes');
const voiceRoutes = require('./routes/voice');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

// Import socket handlers
const socketHandler = require('./services/socketService');

const app = express();
const server = createServer(app);
// Socket.IO CORS configuration for external access
const socketCorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin
    if (!origin) return callback(null, true);
    
    // Get allowed origins from environment variable or use defaults
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',')
      : ["http://localhost:3000"];
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For development, allow any localhost origin
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    }
  },
  methods: ["GET", "POST"],
  credentials: true
};

const io = new Server(server, {
  cors: socketCorsOptions
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration for external access
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Get allowed origins from environment variable or use defaults
    const allowedOrigins = process.env.FRONTEND_URL 
      ? process.env.FRONTEND_URL.split(',')
      : ["http://localhost:3000"];
    
    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // For development, allow any localhost origin
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        callback(null, true);
      } else {
        // For production, allow same IP with different ports (3000 and 6100)
        const originUrl = new URL(origin);
        const allowedUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:3000');
        
        if (originUrl.hostname === allowedUrl.hostname && 
            (originUrl.port === '3000' || originUrl.port === '6100')) {
          callback(null, true);
        } else {
          console.log(`CORS blocked origin: ${origin}, allowed: ${process.env.FRONTEND_URL}`);
          callback(new Error('Not allowed by CORS'));
        }
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Rate limiting - 更宽松的限制用于开发环境
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 100000, // 开发环境允许更多请求
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes); // AI endpoints (public for now)
app.use('/api/voice', voiceRoutes); // Voice endpoints
app.use('/api/customer-types', customerTypesRoutes); // Customer types endpoints
app.use('/api/tasks/dimensions', taskRoutes); // Public endpoint for dimensions
app.use('/api/tasks', authMiddleware, taskRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);

// Socket.IO connection handling
socketHandler(io);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 6100;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };
