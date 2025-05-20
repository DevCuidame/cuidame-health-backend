"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const error_handler_1 = require("../../utils/error-handler");
const chat_bot_service_1 = require("./chat-bot.service");
const chat_message_repository_1 = require("./chat-message.repository");
const logger_1 = __importDefault(require("../../utils/logger"));
class ChatController {
    chatBotService;
    chatMessageRepository;
    constructor() {
        this.chatBotService = new chat_bot_service_1.ChatBotService();
        this.chatMessageRepository = new chat_message_repository_1.ChatMessageRepository();
    }
    /**
     * Start a new chat session
     * @route POST /api/chat/session
     */
    startSession = async (req, res, next) => {
        try {
            logger_1.default.info('🚀 Starting new chat session');
            const session = await this.chatBotService.startNewSession();
            const response = {
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
            logger_1.default.info(`✅ Chat session created: ${session.session_id}`);
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error('❌ Error starting chat session:', error);
            next(error);
        }
    };
    /**
     * Get session status and messages
     * @route GET /api/chat/session/:sessionId
     */
    getSession = async (req, res, next) => {
        try {
            const { sessionId } = req.params;
            logger_1.default.info(`🔍 Getting session: ${sessionId}`);
            if (!sessionId) {
                throw new error_handler_1.BadRequestError('ID de sesión requerido');
            }
            const session = await this.chatBotService.getOrCreateSession(sessionId);
            // CORREGIDO: Usar la instancia de la clase en lugar de req.app.get
            const messages = await this.chatMessageRepository.findBySessionId(session.session_id);
            const formattedMessages = messages.map((message) => ({
                content: message.message_content,
                sender: message.direction === 'outgoing' ? 'bot' : 'user',
                timestamp: message.created_at.toISOString()
            }));
            const response = {
                success: true,
                data: {
                    sessionId: session.session_id,
                    currentStep: session.current_step,
                    messages: formattedMessages,
                    patientId: session.patient_id
                },
                timestamp: new Date().toISOString()
            };
            logger_1.default.info(`✅ Session retrieved: ${session.session_id} with ${formattedMessages.length} messages`);
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error('❌ Error getting session:', error);
            next(error);
        }
    };
    /**
     * Send message to chat
     * @route POST /api/chat/message
     */
    sendMessage = async (req, res, next) => {
        try {
            const { sessionId, message } = req.body;
            logger_1.default.info(`💬 Processing message for session ${sessionId}: "${message}"`);
            if (!sessionId || !message) {
                throw new error_handler_1.BadRequestError('ID de sesión y mensaje requeridos');
            }
            // Process message
            await this.chatBotService.processMessage(sessionId, message);
            // CORREGIDO: Usar la instancia de la clase en lugar de req.app.get
            const messages = await this.chatMessageRepository.getRecentMessages(sessionId, 20);
            const formattedMessages = messages.map((message) => ({
                content: message.message_content,
                sender: message.direction === 'outgoing' ? 'bot' : 'user',
                timestamp: message.created_at.toISOString()
            })).reverse(); // Reversed to get chronological order
            const response = {
                success: true,
                data: {
                    sessionId,
                    messages: formattedMessages
                },
                timestamp: new Date().toISOString()
            };
            logger_1.default.info(`✅ Message processed for session ${sessionId}, returning ${formattedMessages.length} messages`);
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error('❌ Error processing message:', error);
            next(error);
        }
    };
    /**
     * Test route to verify chat is working
     * @route GET /api/chat/test
     */
    test = async (req, res, next) => {
        try {
            logger_1.default.info('🧪 Chat test route accessed');
            const response = {
                success: true,
                message: 'Chat routes are working!',
                data: {
                    timestamp: new Date().toISOString(),
                    environment: process.env.NODE_ENV || 'development'
                },
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            logger_1.default.error('❌ Error in chat test route:', error);
            next(error);
        }
    };
}
exports.ChatController = ChatController;
