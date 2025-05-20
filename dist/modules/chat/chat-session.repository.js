"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatSessionRepository = void 0;
const chat_session_model_1 = require("../../models/chat-session.model");
const base_repository_1 = require("../../core/repositories/base.repository");
// src/modules/chat/repositories/chat-session.repository.ts
class ChatSessionRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(chat_session_model_1.ChatSession);
    }
    /**
     * Find a session by its unique session ID
     */
    async findBySessionId(sessionId) {
        return await this.repository.findOne({
            where: { session_id: sessionId },
        });
    }
    /**
     * Find active sessions for a patient by document number
     */
    async findActiveByDocument(documentNumber) {
        return await this.repository.findOne({
            where: {
                document_number: documentNumber,
                status: chat_session_model_1.ChatSessionStatus.ACTIVE
            },
            order: { created_at: 'DESC' }
        });
    }
}
exports.ChatSessionRepository = ChatSessionRepository;
