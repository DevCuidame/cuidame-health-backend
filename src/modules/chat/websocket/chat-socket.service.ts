// src/modules/chat/websocket/chat-socket.service.ts
import WebSocket from 'ws';
import http from 'http';
import url from 'url';
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
    this.wss = new WebSocket.Server({
      server,
      path: '/ws/chat',
      perMessageDeflate:false,
      maxPayload: 1024 * 1024,
      clientTracking: true,
      verifyClient: (info, callback) => {
        const pathname = url.parse(info.req.url || '').pathname;
        const isValid = pathname === '/ws/chat';
        logger.info(
          `Connection ${isValid ? 'approved' : 'rejected'} for ${pathname}`
        );
        callback(isValid);
      },
    });

    this.chatBotService = new ChatBotService();
    this.chatSessionRepository = new ChatSessionRepository();
    this.chatMessageRepository = new ChatMessageRepository();
    this.clients = new Map();

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

      logger.info(
        `WebSocket client connected: ${clientId} from ${request.socket.remoteAddress}`
      );

      // Send welcome message
      ws.send(
        JSON.stringify({
          type: 'connection',
          clientId,
          message: 'Conectado al servidor de chat',
        })
      );

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

      // Handle pong
      ws.on('pong', () => {
        logger.debug(`Pong received from ${clientId}`);
      });

      // Handle close
      ws.on('close', (code, reason) => {
        logger.info(
          `WebSocket client disconnected: ${clientId}, code: ${code}, reason: ${reason}`
        );
        this.clients.delete(clientId);
      });

      // Handle errors
      ws.on('error', (error) => {
        logger.error(`WebSocket error for client ${clientId}:`, error);
        this.clients.delete(clientId);
      });
    });

    this.wss.on('headers', (headers, request) => {
      logger.debug('WebSocket Headers:', headers);
    });

    // Set up ping interval to keep connections alive
    setInterval(() => {
      this.clients.forEach((ws, clientId) => {
        if (ws.readyState === WebSocket.OPEN) {
          try {
            ws.ping();
          } catch (error) {
            logger.error(`Error pinging client ${clientId}:`, error);
            this.clients.delete(clientId);
          }
        } else {
          this.clients.delete(clientId);
        }
      });
    }, 30000); // Ping every 30 seconds
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

      if (data.sessionId) {
        // Try to resume existing session
        session = await this.chatBotService.getOrCreateSession(data.sessionId);

        // Get previous messages
        const messages = await this.chatMessageRepository.findBySessionId(
          session.session_id
        );

        // Send previous messages to client
        ws.send(
          JSON.stringify({
            type: 'init',
            sessionId: session.session_id,
            messages: messages.map((m: any) => ({
              content: m.message_content,
              sender: m.direction === 'outgoing' ? 'bot' : 'user',
              timestamp: m.created_at,
              sessionId: m.session_id,
            })),
          })
        );
      } else {
        // Create new session
        session = await this.chatBotService.startNewSession();

        // Send welcome message
        ws.send(
          JSON.stringify({
            type: 'init',
            sessionId: session.session_id,
            messages: [
              {
                content:
                  '👋 ¡Hola, me llamo Eli! ¡Bienvenido al sistema de agendamiento de citas médicas! Por favor, ingresa tu número de documento (cédula) para continuar:',
                sender: 'bot',
                timestamp: new Date(),
              },
            ],
          })
        );
      }

      logger.info(
        `Session initialized for client ${clientId}: ${session.session_id}`
      );
    } catch (error) {
      logger.error(`Error initializing session for client ${clientId}:`, error);
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Error al inicializar la sesión',
        })
      );
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
      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Session ID y mensaje son requeridos',
        })
      );
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
          ws.send(
            JSON.stringify({
              type: 'message',
              messages: newMessages,
            })
          );

          logger.info(
            `Sent ${newMessages.length} bot responses to client ${clientId}`
          );
        }
      }
    } catch (error) {
      logger.error(`Error processing chat message from ${clientId}:`, error);

      ws.send(
        JSON.stringify({
          type: 'error',
          message: 'Error al procesar el mensaje',
        })
      );
    }
  }
}
