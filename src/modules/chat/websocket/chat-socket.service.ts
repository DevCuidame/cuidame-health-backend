import WebSocket from 'ws';
import http from 'http';
import url from 'url';
import { ChatBotService } from '../chat-bot.service';
import { ChatMessageRepository } from '../chat-message.repository';
import logger from '../../../utils/logger';
import { ChatSessionRepository } from '../chat-session.repository';
import { v4 as uuidv4 } from 'uuid';
export class ChatSocketService {
  private wss: WebSocket.Server;
  private chatBotService: ChatBotService;
  private chatSessionRepository: ChatSessionRepository;
  private chatMessageRepository: ChatMessageRepository;
  private clients: Map<string, WebSocket>;
  private messageQueue: Map<string, any[]>; // Cola de mensajes por cliente
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(server: http.Server) {
    this.wss = new WebSocket.Server({
      noServer: true, 
      path: '/ws/chat',
      perMessageDeflate: {
        // Habilitar compresión para reducir ancho de banda
        threshold: 512, // Reducido para comprimir más mensajes
        concurrencyLimit: 10,
        serverMaxWindowBits: 13, // Ventana más pequeña para conexiones débiles
        clientMaxWindowBits: 13,
        zlibDeflateOptions: {
          level: 6, // Balance entre compresión y velocidad
          memLevel: 7, // Uso moderado de memoria
        }
      },
      maxPayload: 1024 * 1024,
      clientTracking: true,
      skipUTF8Validation: false,
    });

    this.chatBotService = new ChatBotService();
    this.chatSessionRepository = new ChatSessionRepository();
    this.chatMessageRepository = new ChatMessageRepository();
    this.clients = new Map();
    this.messageQueue = new Map();

    this.initialize();
  }

  public getServer(): WebSocket.Server {
    return this.wss;
  }

  private initialize(): void {
    // Log when server is ready
    this.wss.on('listening', () => {
      logger.info('WebSocket server is listening on /ws/chat');
    });

    this.wss.on('connection', (ws: WebSocket, request) => {
      // Generate client ID
      const clientId = uuidv4();
      this.clients.set(clientId, ws);
      
      // Configurar propiedades de conexión para heartbeat
      (ws as any).isAlive = true;
      (ws as any).clientId = clientId;

      logger.info(
        `WebSocket client connected: ${clientId} from ${request.socket.remoteAddress}`
      );

      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connection',
        clientId,
        message: 'Conectado al servidor de chat',
      });

      // Handle messages
      ws.on('message', async (message: string) => {
        try {
          let data;
          try {
            data = JSON.parse(message);
          } catch (parseError) {
            logger.error(`Invalid JSON received: ${message}`);
            ws.send(
              JSON.stringify({
                type: 'error',
                message: 'Formato de mensaje inválido',
              })
            );
            return;
          }

          logger.info(`Message received from ${clientId}:`, data);

          switch (data.type) {
            case 'init':
              await this.handleInitMessage(clientId, ws, data);
              break;
            case 'message':
              await this.handleChatMessage(clientId, ws, data);
              break;
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }));
              break;
            default:
              logger.warn(`Unknown message type: ${data.type}`);
              ws.send(
                JSON.stringify({
                  type: 'error',
                  message: 'Tipo de mensaje no reconocido',
                })
              );
          }
        } catch (error) {
          logger.error(
            `Error handling WebSocket message from ${clientId}:`,
            error
          );
          ws.send(
            JSON.stringify({
              type: 'error',
              message: 'Error interno al procesar el mensaje',
            })
          );
        }
      });

      // Handle pong - mejorado para heartbeat
      ws.on('pong', () => {
        (ws as any).isAlive = true;
        logger.debug(`Heartbeat confirmed from ${clientId}`);
      });

      // Handle close
      ws.on('close', (code, reason) => {
        logger.info(
          `WebSocket client disconnected: ${clientId}, code: ${code}, reason: ${reason}`
        );
        this.clients.delete(clientId);
        this.messageQueue.delete(clientId); // Limpiar cola de mensajes
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
        this.messageQueue.delete(clientId); // Limpiar cola de mensajes
      });
    });

    this.wss.on('headers', (headers, request) => {
      logger.debug('WebSocket Headers:', headers);
    });

    // Heartbeat mejorado y más frecuente
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocket) => {
        const extWs = ws as any;
        
        if (extWs.isAlive === false) {
          logger.warn(`Terminating unresponsive connection: ${extWs.clientId}`);
          this.clients.delete(extWs.clientId);
          this.messageQueue.delete(extWs.clientId);
          return ws.terminate();
        }
        
        extWs.isAlive = false;
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.ping();
          } catch (error) {
            logger.error(`Error pinging client ${extWs.clientId}:`, error);
            this.clients.delete(extWs.clientId);
            this.messageQueue.delete(extWs.clientId);
            ws.terminate();
          }
        }
      });
    }, 15000); // Ping cada 15 segundos en lugar de 30
    
    // Limpiar intervalo cuando el servidor se cierre
    this.wss.on('close', () => {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }
    });
  }

  /**
   * Handle initialization message
   */
  private async handleInitMessage(
    clientId: string,
    ws: WebSocket,
    data: any
  ): Promise<void> {
    try {
      let session;
      
      // Configurar timeout para operaciones de base de datos
      const dbTimeout = setTimeout(() => {
        throw new Error('Database operation timeout');
      }, 5000);
      
      try {
        if (data.sessionId) {
          // Intentar recuperar sesión existente con mejor manejo de errores
          session = await this.chatBotService.getOrCreateSession(data.sessionId);
          
          if (session) {
            // Obtener mensajes previos con límite para mejorar rendimiento
            const messages = await this.chatMessageRepository.findBySessionId(
              session.session_id
            );
            
            // Limitar a últimos 50 mensajes
            const limitedMessages = messages.slice(-50);
            
            // Enviar estado de recuperación
            this.sendToClient(clientId, {
              type: 'init',
              sessionId: session.session_id,
              recovered: true,
              messages: limitedMessages.map((m: any) => ({
                content: m.message_content,
                sender: m.direction === 'outgoing' ? 'bot' : 'user',
                timestamp: m.created_at,
                sessionId: m.session_id,
              })),
            });
            
            logger.info(`Session recovered for client ${clientId}: ${session.session_id}`);
          }
        } else {
          // Crear nueva sesión
          session = await this.chatBotService.startNewSession();
          
          this.sendToClient(clientId, {
            type: 'init',
            sessionId: session.session_id,
            recovered: false,
            messages: [
              {
                content: '👋 ¡Hola, me llamo Eli! ¡Bienvenido al sistema de agendamiento de citas médicas! Por favor, ingresa tu número de documento (cédula) para continuar:',
                sender: 'bot',
                timestamp: new Date(),
              },
            ],
          });
          
          logger.info(`New session created for client ${clientId}: ${session.session_id}`);
        }
      } finally {
        clearTimeout(dbTimeout);
      }
    } catch (error) {
      logger.error(`Error initializing session for client ${clientId}:`, error);
      
      // Enviar error más específico
      this.sendToClient(clientId, {
        type: 'error',
        code: 'INIT_ERROR',
        message: 'Error al inicializar la sesión. Por favor, intenta nuevamente.',
        retryable: true,
      });
    }
  }

  /**
   * Handle chat message
   */
  private async handleChatMessage(
    clientId: string,
    ws: WebSocket,
    data: any
  ): Promise<void> {
    if (!data.sessionId || !data.message) {
      this.sendToClient(clientId, {
        type: 'error',
        code: 'VALIDATION_ERROR',
        message: 'Session ID y mensaje son requeridos',
        retryable: false,
      });
      return;
    }

    try {
      logger.info(
        `Processing message for session ${data.sessionId}: ${data.message}`
      );

      // Process message
      await this.chatBotService.processMessage(data.sessionId, data.message);

      // Get all bot responses since user's message
      const messages = await this.chatMessageRepository.findBySessionId(
        data.sessionId
      );

      // Find index of user's last message
      const userMessageIndex = messages.findIndex(
        (m: any) =>
          m.direction === 'incoming' && m.message_content === data.message
      );

      if (userMessageIndex >= 0) {
        // Get all bot messages after user's message
        const newMessages = messages
          .slice(userMessageIndex + 1)
          .filter((m: any) => m.direction === 'outgoing')
          .map((m: any) => ({
            content: m.message_content,
            sender: 'bot',
            timestamp: m.created_at,
          }));

        // Send bot responses to client
        if (newMessages.length > 0) {
          this.sendToClient(clientId, {
            type: 'message',
            messages: newMessages,
          });

          logger.info(
            `Sent ${newMessages.length} bot responses to client ${clientId}`
          );
        }
      }
    } catch (error) {
      logger.error(`Error processing chat message from ${clientId}:`, error);

      this.sendToClient(clientId, {
        type: 'error',
        code: 'PROCESSING_ERROR',
        message: 'Error al procesar el mensaje',
        retryable: true,
      });
    }
  }

  /**
   * Enviar mensaje a cliente con cola de respaldo
   */
  private sendToClient(clientId: string, message: any): void {
    const ws = this.clients.get(clientId);
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(message));
        
        // Enviar mensajes en cola si los hay
        const queuedMessages = this.messageQueue.get(clientId);
        if (queuedMessages && queuedMessages.length > 0) {
          queuedMessages.forEach(queuedMsg => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(queuedMsg));
            }
          });
          this.messageQueue.delete(clientId);
          logger.info(`Sent ${queuedMessages.length} queued messages to ${clientId}`);
        }
      } catch (error) {
        logger.error(`Error sending message to ${clientId}:`, error);
        this.queueMessage(clientId, message);
      }
    } else {
      // Encolar mensaje si la conexión no está disponible
      this.queueMessage(clientId, message);
    }
  }
  
  /**
   * Encolar mensaje para envío posterior
   */
  private queueMessage(clientId: string, message: any): void {
    if (!this.messageQueue.has(clientId)) {
      this.messageQueue.set(clientId, []);
    }
    
    const queue = this.messageQueue.get(clientId)!;
    queue.push(message);
    
    // Limitar tamaño de cola
    if (queue.length > 10) {
      queue.shift(); // Remover mensaje más antiguo
    }
    
    logger.debug(`Message queued for ${clientId}. Queue size: ${queue.length}`);
  }
}
