 
  // src/modules/chat/websocket/chat-socket.service.ts
  import WebSocket from 'ws';
  import http from 'http';
  import { v4 as uuidv4 } from 'uuid';
  import { ChatBotService } from '../chat-bot.service';
  import { ChatMessageRepository } from '../chat-message.repository';
  import logger from '../../../utils/logger';
import { ChatSessionRepository } from '../chat-session.repository';
  
  export class ChatSocketService {
    private wss: WebSocket.Server;
    private chatBotService: ChatBotService;
    private chatSessionRepository: ChatSessionRepository;
    private chatMessageRepository: ChatMessageRepository;
    private clients: Map<string, WebSocket>;
  
    constructor(server: http.Server) {
      this.wss = new WebSocket.Server({ server, path: '/ws/chat', perMessageDeflate: false });
      this.chatBotService = new ChatBotService();
      this.chatSessionRepository = new ChatSessionRepository();
      this.chatMessageRepository = new ChatMessageRepository();
      this.clients = new Map();
      console.log("WebSocket server inicializado en la ruta /ws/chat");
      
      this.initialize();
    }
  
    private initialize(): void {
      this.wss.on('connection', (ws: WebSocket) => {
        // Generate client ID
        const clientId = uuidv4();
        this.clients.set(clientId, ws);
        
        logger.info(`WebSocket client connected: ${clientId}`);
        
        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connection',
          clientId,
          message: 'Conectado al servidor de chat'
        }));
        
        // Handle messages
        ws.on('message', async (message: string) => {
          try {
            const data = JSON.parse(message);
            
            switch (data.type) {
              case 'init':
                await this.handleInitMessage(clientId, ws, data);
                break;
              case 'message':
                await this.handleChatMessage(clientId, ws, data);
                break;
              default:
                ws.send(JSON.stringify({
                  type: 'error',
                  message: 'Tipo de mensaje no reconocido'
                }));
            }
          } catch (error) {
            logger.error(`Error handling WebSocket message: ${error}`);
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Error al procesar el mensaje'
            }));
          }
        });
        
        // Handle close
        ws.on('close', () => {
          logger.info(`WebSocket client disconnected: ${clientId}`);
          this.clients.delete(clientId);
        });
      });
      
      this.wss.on('error', (error) => {
        console.log("🚀 ~ ChatSocketService ~ this.wss.on ~ error:", error)
        logger.error(`Error en servidor WebSocket: ${error}`);
      });
    }
  
    /**
     * Handle initialization message
     */
    private async handleInitMessage(clientId: string, ws: WebSocket, data: any): Promise<void> {
      let session;
      
      if (data.sessionId) {
        // Try to resume existing session
        session = await this.chatBotService.getOrCreateSession(data.sessionId);
        
        // Get previous messages
        const messages = await this.chatMessageRepository.findBySessionId(session.session_id);
        
        // Send previous messages to client
        ws.send(JSON.stringify({
          type: 'init',
          sessionId: session.session_id,
          messages: messages.map((m: any) => ({
            content: m.message_content,
            sender: m.direction === 'outgoing' ? 'bot' : 'user',
            timestamp: m.created_at,
            sessionId: m.session_id
          }))
        }));
      } else {
        // Create new session
        session = await this.chatBotService.startNewSession();
        
        // Send welcome message
        ws.send(JSON.stringify({
          type: 'init',
          sessionId: session.session_id,
          messages: [{
            content: '👋 ¡Bienvenido al sistema de agendamiento de citas médicas! Por favor, ingresa tu número de documento (cédula) para continuar:',
            sender: 'bot',
            timestamp: new Date()
          }]
        }));
      }
    }
  
    /**
     * Handle chat message
     */
    private async handleChatMessage(clientId: string, ws: WebSocket, data: any): Promise<void> {
      if (!data.sessionId || !data.message) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Session ID y mensaje son requeridos'
        }));
        return;
      }
      
      try {
        // Process message
        await this.chatBotService.processMessage(data.sessionId, data.message);
        
        // Get all bot responses since user's message
        const messages = await this.chatMessageRepository.findBySessionId(data.sessionId);
        
        // Find index of user's last message
        const userMessageIndex = messages.findIndex((m: any) => 
          m.direction === 'incoming' && m.message_content === data.message
        );
        
        if (userMessageIndex >= 0) {
          // Get all bot messages after user's message
          const newMessages = messages
            .slice(userMessageIndex + 1)
            .filter((m:any) => m.direction === 'outgoing')
            .map((m:any) => ({
              content: m.message_content,
              sender: 'bot',
              timestamp: m.created_at
            }));
          
          // Send bot responses to client
          ws.send(JSON.stringify({
            type: 'message',
            messages: newMessages
          }));
        }
      } catch (error) {
        logger.error(`Error processing chat message: ${error}`);
        
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Error al procesar el mensaje'
        }));
      }
    }
  }
  
