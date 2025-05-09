
  
  // src/modules/chat/chat.controller.ts
  import { Request, Response, NextFunction } from 'express';
  import { ApiResponse } from '../../core/interfaces/response.interface';
  import { BadRequestError } from '../../utils/error-handler';
import { ChatBotService } from './chat-bot.service';
import { ChatMessageRepository } from './chat-message.repository';
  
  export class ChatController {
    private chatBotService: ChatBotService;
  
    constructor() {
      this.chatBotService = new ChatBotService();
    }
  
    /**
     * Start a new chat session
     * @route POST /api/chat/session
     */
    startSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
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
        
        res.status(200).json(response);
      } catch (error) {
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
        
        if (!sessionId) {
          throw new BadRequestError('ID de sesión requerido');
        }
        
        const session = await this.chatBotService.getOrCreateSession(sessionId);
        
        // Create the repository instance
        const chatMessageRepository = new ChatMessageRepository();
        const messages = await chatMessageRepository.findBySessionId(session.session_id);
        
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
        
        res.status(200).json(response);
      } catch (error) {
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
        
        if (!sessionId || !message) {
          throw new BadRequestError('ID de sesión y mensaje requeridos');
        }
        
        // Process message
        await this.chatBotService.processMessage(sessionId, message);
        
        // Get updated messages
        const chatMessageRepository = req.app.get('chatMessageRepository');
        const messages = await chatMessageRepository.getRecentMessages(sessionId, 20);
        
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
        
        res.status(200).json(response);
      } catch (error) {
        next(error);
      }
    };
  }
  