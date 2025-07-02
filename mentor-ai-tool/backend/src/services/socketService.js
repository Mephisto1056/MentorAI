const PracticeSession = require('../models/PracticeSession');
const aiService = require('./aiService');
const logger = require('../utils/logger');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`);

    // Join a practice session room
    socket.on('join_session', async (data) => {
      try {
        const { sessionId, userId } = data;
        
        // For demo purposes, allow joining any session with demo-user
        if (userId === 'demo-user') {
          socket.join(sessionId);
          socket.emit('joined_session', { sessionId });
          logger.info(`Demo user joined session ${sessionId}`);
          return;
        }
        
        // Verify session exists and user has access
        const session = await PracticeSession.findById(sessionId);
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // For demo purposes, allow demo-user or if no studentId is set
        if (session.studentId && session.studentId.toString() !== userId && userId !== 'demo-user') {
          socket.emit('error', { message: 'Unauthorized access to session' });
          return;
        }

        socket.join(sessionId);
        socket.emit('joined_session', { sessionId });
        
        logger.info(`User ${userId} joined session ${sessionId}`);
      } catch (error) {
        logger.error('Join session error:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Handle student message
    socket.on('send_message', async (data) => {
      try {
        const { sessionId, message, userId } = data;
        
        const session = await PracticeSession.findById(sessionId);
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // For demo purposes, allow demo-user or if no studentId is set
        if (session.studentId && session.studentId.toString() !== userId && userId !== 'demo-user') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Add student message to conversation
        await session.addMessage('student', message);

        // Broadcast message to session room
        io.to(sessionId).emit('new_message', {
          role: 'student',
          message,
          timestamp: new Date()
        });

        logger.info(`Message sent in session ${sessionId}`);
      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Request AI response
    socket.on('request_ai_response', async (data) => {
      try {
        const { sessionId, userId } = data;
        
        const session = await PracticeSession.findById(sessionId)
          .populate('taskTemplateId');
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // For demo purposes, allow demo-user or if no studentId is set
        if (session.studentId && session.studentId.toString() !== userId && userId !== 'demo-user') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Generate AI response using the task configuration
        const taskConfig = session.taskTemplateId ? session.taskTemplateId.configuration : session.taskConfig;
        const aiResponse = await aiService.generateCustomerResponse(
          session.conversation,
          session.customerProfile,
          taskConfig
        );

        // Add AI message to conversation
        if (session.addMessage) {
          await session.addMessage('ai_customer', aiResponse);
        } else {
          // Fallback: directly update conversation array
          session.conversation.push({
            role: 'ai_customer',
            message: aiResponse,
            timestamp: new Date()
          });
          await session.save();
        }

        // Broadcast AI response to session room
        io.to(sessionId).emit('new_message', {
          role: 'ai_customer',
          message: aiResponse,
          timestamp: new Date()
        });

        logger.info(`AI response generated for session ${sessionId}`);
      } catch (error) {
        logger.error('AI response error:', error);
        socket.emit('error', { message: 'Failed to generate AI response' });
      }
    });

    // Handle evaluation request
    socket.on('request_evaluation', async (data) => {
      try {
        const { sessionId, userId } = data;
        
        const session = await PracticeSession.findById(sessionId)
          .populate('taskTemplateId');
        
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // For demo purposes, allow demo-user or if no studentId is set
        if (session.studentId && session.studentId.toString() !== userId && userId !== 'demo-user') {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        // Generate AI evaluation
        const evaluation = await aiService.evaluatePerformance(
          session.conversation,
          session.taskTemplateId.evaluationCriteria
        );

        // Update session with AI evaluation
        session.aiEvaluation = evaluation;
        await session.save();

        // Send evaluation to user
        socket.emit('evaluation_complete', {
          sessionId,
          evaluation
        });

        logger.info(`AI evaluation completed for session ${sessionId}`);
      } catch (error) {
        logger.error('Evaluation error:', error);
        socket.emit('error', { message: 'Failed to generate evaluation' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
