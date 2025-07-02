# MentorAI - AI-Powered Mentoring Platform

MentorAI is an intelligent mentoring platform that provides personalized guidance and evaluation for learners through AI-powered conversations and assessments.

## 🚀 Features

- **AI-Powered Chat**: Interactive conversations with AI mentors
- **Task Generation**: Automatically generate practice tasks and challenges
- **Performance Evaluation**: Comprehensive assessment and feedback system
- **Dashboard Analytics**: Track learning progress and performance metrics
- **Real-time Communication**: WebSocket-based real-time interactions

## 🏗️ Project Structure

```
MentorAI/
├── mentor-ai-tool/
│   ├── frontend/          # Next.js React frontend
│   │   ├── src/
│   │   │   └── app/       # App router pages
│   │   ├── public/        # Static assets
│   │   └── package.json
│   └── backend/           # Node.js Express backend
│       ├── src/
│       │   ├── routes/    # API routes
│       │   ├── models/    # Database models
│       │   ├── services/  # Business logic
│       │   ├── middleware/# Express middleware
│       │   └── utils/     # Utility functions
│       ├── docs/          # Documentation
│       └── package.json
├── POC_Design_Document.md # Project design documentation
├── sysdesign.md          # System design documentation
└── README.md             # This file
```

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React** - UI library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time communication
- **MongoDB** - Database (via Mongoose)
- **Winston** - Logging

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB database

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone git@github.com:Mephisto1056/MentorAI.git
cd MentorAI
```

### 2. Backend Setup
```bash
cd mentor-ai-tool/backend
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Environment Configuration

Create a `.env` file in the backend directory with the following variables:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/mentorai

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-jwt-secret-key

# AI Service (if applicable)
AI_API_KEY=your-ai-api-key
AI_API_URL=your-ai-service-url
```

### 5. Run the Application

#### Start Backend Server
```bash
cd mentor-ai-tool/backend
npm start
```

#### Start Frontend Development Server
```bash
cd mentor-ai-tool/frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Core Features
- `GET /api/sessions` - Get practice sessions
- `POST /api/sessions` - Create new session
- `GET /api/tasks` - Get available tasks
- `POST /api/evaluations` - Submit evaluation
- `GET /api/analytics` - Get user analytics

## 🧪 Testing

### Backend Tests
```bash
cd mentor-ai-tool/backend
npm test
```

### Frontend Tests
```bash
cd mentor-ai-tool/frontend
npm test
```

## 📖 Documentation

- [AI Integration Guide](mentor-ai-tool/AI_INTEGRATION_GUIDE.md)
- [Evaluation System Test](mentor-ai-tool/EVALUATION_SYSTEM_TEST.md)
- [Backend Documentation](mentor-ai-tool/backend/README.md)
- [AliCloud Setup Guide](mentor-ai-tool/backend/docs/alicloud-setup.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔧 Development Notes

- The project uses ESLint and Prettier for code formatting
- WebSocket connections are handled through Socket.io
- Database operations use Mongoose ODM
- Frontend uses Next.js App Router for routing
- Real-time features are implemented with WebSocket connections

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Make sure ports 3000 and 3001 are available
2. **Database connection**: Ensure MongoDB is running and accessible
3. **Environment variables**: Check that all required environment variables are set
4. **Node version**: Ensure you're using Node.js v18 or higher

### Getting Help

If you encounter issues:
1. Check the logs in `mentor-ai-tool/backend/logs/`
2. Verify your environment configuration
3. Ensure all dependencies are installed
4. Check the browser console for frontend errors

## 📞 Contact

For questions or support, please open an issue on GitHub.
