"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSocketService = void 0;
// src/modules/chat/websocket/chat-socket.service.ts
const ws_1 = __importDefault(require("ws"));
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
        this.wss = new ws_1.default.Server({ server, path: '/ws/chat', perMessageDeflate: false });
        this.chatBotService = new chat_bot_service_1.ChatBotService();
        this.chatSessionRepository = new chat_session_repository_1.ChatSessionRepository();
        this.chatMessageRepository = new chat_message_repository_1.ChatMessageRepository();
        this.clients = new Map();
        this.initialize();
    }
    initialize() {
        this.wss.on('connection', (ws) => {
            // Generate client ID
            const clientId = (0, uuid_1.v4)();
            this.clients.set(clientId, ws);
            logger_1.default.info(`WebSocket client connected: ${clientId}`);
            // Send welcome message
            ws.send(JSON.stringify({
                type: 'connection',
                clientId,
                message: 'Conectado al servidor de chat'
            }));
            // Handle messages
            ws.on('message', async (message) => {
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
                }
                catch (error) {
                    logger_1.default.error(`Error handling WebSocket message: ${error}`);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Error al procesar el mensaje'
                    }));
                }
            });
            // Handle close
            ws.on('close', () => {
                logger_1.default.info(`WebSocket client disconnected: ${clientId}`);
                this.clients.delete(clientId);
            });
        });
        this.wss.on('error', (error) => {
            console.log("🚀 ~ ChatSocketService ~ this.wss.on ~ error:", error);
            logger_1.default.error(`Error en servidor WebSocket: ${error}`);
        });
    }
    /**
     * Handle initialization message
     */
    async handleInitMessage(clientId, ws, data) {
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
                    sessionId: m.session_id
                }))
            }));
        }
        else {
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
    async handleChatMessage(clientId, ws, data) {
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
            const userMessageIndex = messages.findIndex((m) => m.direction === 'incoming' && m.message_content === data.message);
            if (userMessageIndex >= 0) {
                // Get all bot messages after user's message
                const newMessages = messages
                    .slice(userMessageIndex + 1)
                    .filter((m) => m.direction === 'outgoing')
                    .map((m) => ({
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
        }
        catch (error) {
            logger_1.default.error(`Error processing chat message: ${error}`);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Error al procesar el mensaje'
            }));
        }
    }
}
exports.ChatSocketService = ChatSocketService;
