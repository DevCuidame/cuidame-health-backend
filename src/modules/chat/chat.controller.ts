// src/modules/chat/chat.controller.ts
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../core/interfaces/response.interface';
import { BadRequestError } from '../../utils/error-handler';
import { ChatBotService } from './chat-bot.service';
import { ChatMessageRepository } from './chat-message.repository';
import logger from '../../utils/logger';

export class ChatController {
  private chatBotService: ChatBotService;
  private chatMessageRepository: ChatMessageRepository;

  constructor() {
    this.chatBotService = new ChatBotService();
    this.chatMessageRepository = new ChatMessageRepository();
  }

  /**
   * Start a new chat session
   * @route POST /api/chat/session
   */
  startSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('🚀 Starting new chat session');
      const session = await this.chatBotService.startNewSession();
      
      const response: ApiResponse = {
        success: true,
        data: {
          sessionId: session.session_id,
          messages: [
            {
              content: '👋 ¡Bienvenido al sistema de agendamiento de citas médicas! Por favor, ingresa tu número de documento (cédula) para continuar:',
              sender: 'bot',
              timestamp: new Date().toISOString()
            }
          ]
        },
        timestamp: new Date().toISOString()
      };
      
      logger.info(`✅ Chat session created: ${session.session_id}`);
      res.status(200).json(response);
    } catch (error) {
      logger.error('❌ Error starting chat session:', error);
      next(error);
    }
  };

  /**
   * Get session status and messages
   * @route GET /api/chat/session/:sessionId
   */
  getSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId } = req.params;
      
      logger.info(`🔍 Getting session: ${sessionId}`);
      
      if (!sessionId) {
        throw new BadRequestError('ID de sesión requerido');
      }
      
      const session = await this.chatBotService.getOrCreateSession(sessionId);
      
      // CORREGIDO: Usar la instancia de la clase en lugar de req.app.get
      const messages = await this.chatMessageRepository.findBySessionId(session.session_id);
      
      const formattedMessages = messages.map((message: any) => ({
        content: message.message_content,
        sender: message.direction === 'outgoing' ? 'bot' : 'user',
        timestamp: message.created_at.toISOString()
      }));
      
      const response: ApiResponse = {
        success: true,
        data: {
          sessionId: session.session_id,
          currentStep: session.current_step,
          messages: formattedMessages,
          patientId: session.patient_id
        },
        timestamp: new Date().toISOString()
      };
      
      logger.info(`✅ Session retrieved: ${session.session_id} with ${formattedMessages.length} messages`);
      res.status(200).json(response);
    } catch (error) {
      logger.error('❌ Error getting session:', error);
      next(error);
    }
  };

  /**
   * Send message to chat
   * @route POST /api/chat/message
   */
  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId, message } = req.body;
      
      logger.info(`💬 Processing message for session ${sessionId}: "${message}"`);
      
      if (!sessionId || !message) {
        throw new BadRequestError('ID de sesión y mensaje requeridos');
      }
      
      // Process message
      await this.chatBotService.processMessage(sessionId, message);
      
      // CORREGIDO: Usar la instancia de la clase en lugar de req.app.get
      const messages = await this.chatMessageRepository.getRecentMessages(sessionId, 20);
      
      const formattedMessages = messages.map((message: any) => ({
        content: message.message_content,
        sender: message.direction === 'outgoing' ? 'bot' : 'user',
        timestamp: message.created_at.toISOString()
      })).reverse(); // Reversed to get chronological order
      
      const response: ApiResponse = {
        success: true,
        data: {
          sessionId,
          messages: formattedMessages
        },
        timestamp: new Date().toISOString()
      };
      
      logger.info(`✅ Message processed for session ${sessionId}, returning ${formattedMessages.length} messages`);
      res.status(200).json(response);
    } catch (error) {
      logger.error('❌ Error processing message:', error);
      next(error);
    }
  };

  /**
   * Test route to verify chat is working
   * @route GET /api/chat/test
   */
  test = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('🧪 Chat test route accessed');
      
      const response: ApiResponse = {
        success: true,
        message: 'Chat routes are working!',
        data: {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        },
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      logger.error('❌ Error in chat test route:', error);
      next(error);
    }
  };
}