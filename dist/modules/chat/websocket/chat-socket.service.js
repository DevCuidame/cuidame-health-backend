"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSocketService = void 0;
// src/modules/chat/websocket/chat-socket.service.ts
const ws_1 = __importDefault(require("ws"));
const url_1 = __importDefault(require("url"));
const uuid_1 = require("uuid");
const chat_bot_service_1 = require("../chat-bot.service");
const chat_message_repository_1 = require("../chat-message.repository");
const logger_1 = __importDefault(require("../../../utils/logger"));
const chat_session_repository_1 = require("../chat-session.repository");
class ChatSocketService {
    wss;
    chatBotService;
    chatSessionRepository;
    chatMessageRepository;
    clients;
    constructor(server) {
        this.wss = new ws_1.default.Server({
            server,
            path: '/ws/chat',
            perMessageDeflate: {
                zlibDeflateOptions: {
                    chunkSize: 1024,
                    memLevel: 7,
                    level: 3,
                },
                zlibInflateOptions: {
                    chunkSize: 10 * 1024,
                },
                // Other options
                clientNoContextTakeover: true,
                serverNoContextTakeover: true,
                serverMaxWindowBits: 10,
                threshold: 1024, // Size (in bytes) below which messages should not be compressed
            },
            maxPayload: 1024 * 1024,
            clientTracking: true,
            verifyClient: (info, callback) => {
                const pathname = url_1.default.parse(info.req.url || '').pathname;
                const isValid = pathname === '/ws/chat';
                logger_1.default.info(`Connection ${isValid ? 'approved' : 'rejected'} for ${pathname}`);
                callback(isValid);
            },
        });
        this.chatBotService = new chat_bot_service_1.ChatBotService();
        this.chatSessionRepository = new chat_session_repository_1.ChatSessionRepository();
        this.chatMessageRepository = new chat_message_repository_1.ChatMessageRepository();
        this.clients = new Map();
        this.initialize();
    }
    initialize() {
        // Log when server is ready
        this.wss.on('listening', () => {
            logger_1.default.info('WebSocket server is listening on /ws/chat');
        });
        this.wss.on('connection', (ws, request) => {
            // Generate client ID
            const clientId = (0, uuid_1.v4)();
            this.clients.set(clientId, ws);
            logger_1.default.info(`WebSocket client connected: ${clientId} from ${request.socket.remoteAddress}`);
            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connection',
                clientId,
                message: 'Conectado al servidor de chat',
            }));
            // Handle messages
            ws.on('message', async (message) => {
                try {
                    let data;
                    try {
                        data = JSON.parse(message);
                    }
                    catch (parseError) {
                        logger_1.default.error(`Invalid JSON received: ${message}`);
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Formato de mensaje inválido',
                        }));
                        return;
                    }
                    logger_1.default.info(`Message received from ${clientId}:`, data);
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
                            logger_1.default.warn(`Unknown message type: ${data.type}`);
                            ws.send(JSON.stringify({
                                type: 'error',
                                message: 'Tipo de mensaje no reconocido',
                            }));
                    }
                }
                catch (error) {
                    logger_1.default.error(`Error handling WebSocket message from ${clientId}:`, error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Error interno al procesar el mensaje',
                    }));
                }
            });
            // Handle pong
            ws.on('pong', () => {
                logger_1.default.debug(`Pong received from ${clientId}`);
            });
            // Handle close
            ws.on('close', (code, reason) => {
                logger_1.default.info(`WebSocket client disconnected: ${clientId}, code: ${code}, reason: ${reason}`);
                this.clients.delete(clientId);
            });
            // Handle errors
            ws.on('error', (error) => {
                logger_1.default.error(`WebSocket error for client ${clientId}:`, error);
                this.clients.delete(clientId);
            });
        });
        this.wss.on('headers', (headers, request) => {
            logger_1.default.debug('WebSocket Headers:', headers);
        });
        // Set up ping interval to keep connections alive
        setInterval(() => {
            this.clients.forEach((ws, clientId) => {
                if (ws.readyState === ws_1.default.OPEN) {
                    try {
                        ws.ping();
                    }
                    catch (error) {
                        logger_1.default.error(`Error pinging client ${clientId}:`, error);
                        this.clients.delete(clientId);
                    }
                }
                else {
                    this.clients.delete(clientId);
                }
            });
        }, 30000); // Ping every 30 seconds
    }
    /**
     * Handle initialization message
     */
    async handleInitMessage(clientId, ws, data) {
        try {
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
                    messages: messages.map((m) => ({
                        content: m.message_content,
                        sender: m.direction === 'outgoing' ? 'bot' : 'user',
                        timestamp: m.created_at,
                        sessionId: m.session_id,
                    })),
                }));
            }
            else {
                // Create new session
                session = await this.chatBotService.startNewSession();
                // Send welcome message
                ws.send(JSON.stringify({
                    type: 'init',
                    sessionId: session.session_id,
                    messages: [
                        {
                            content: '👋 ¡Hola, me llamo Eli! ¡Bienvenido al sistema de agendamiento de citas médicas! Por favor, ingresa tu número de documento (cédula) para continuar:',
                            sender: 'bot',
                            timestamp: new Date(),
                        },
                    ],
                }));
            }
            logger_1.default.info(`Session initialized for client ${clientId}: ${session.session_id}`);
        }
        catch (error) {
            logger_1.default.error(`Error initializing session for client ${clientId}:`, error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Error al inicializar la sesión',
            }));
        }
    }
    /**
     * Handle chat message
     */
    async handleChatMessage(clientId, ws, data) {
        if (!data.sessionId || !data.message) {
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Session ID y mensaje son requeridos',
            }));
            return;
        }
        try {
            logger_1.default.info(`Processing message for session ${data.sessionId}: ${data.message}`);
            // Process message
            await this.chatBotService.processMessage(data.sessionId, data.message);
            // Get all bot responses since user's message
            const messages = await this.chatMessageRepository.findBySessionId(data.sessionId);
            // Find index of user's last message
            const userMessageIndex = messages.findIndex((m) => m.direction === 'incoming' && m.message_content === data.message);
            if (userMessageIndex >= 0) {
                // Get all bot messages after user's message
                const newMessages = messages
                    .slice(userMessageIndex + 1)
                    .filter((m) => m.direction === 'outgoing')
                    .map((m) => ({
                    content: m.message_content,
                    sender: 'bot',
                    timestamp: m.created_at,
                }));
                // Send bot responses to client
                if (newMessages.length > 0) {
                    ws.send(JSON.stringify({
                        type: 'message',
                        messages: newMessages,
                    }));
                    logger_1.default.info(`Sent ${newMessages.length} bot responses to client ${clientId}`);
                }
            }
        }
        catch (error) {
            logger_1.default.error(`Error processing chat message from ${clientId}:`, error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Error al procesar el mensaje',
            }));
        }
    }
}
exports.ChatSocketService = ChatSocketService;
