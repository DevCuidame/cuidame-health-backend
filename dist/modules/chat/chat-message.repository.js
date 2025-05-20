"use strict";
// src/modules/chat/repositories/chat-message.repository.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessageRepository = void 0;
const chat_message_model_1 = require("../../models/chat-message.model");
const base_repository_1 = require("../../core/repositories/base.repository");
class ChatMessageRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(chat_message_model_1.ChatMessage);
    }
    /**
     * Find messages by session ID
     */
    async findBySessionId(sessionId) {
        return await this.repository.find({
            where: { session_id: sessionId },
            order: { created_at: 'ASC' },
        });
    }
    /**
     * Get most recent conversation for a session
     */
    async getRecentMessages(sessionId, limit = 10) {
        return await this.repository.find({
            where: { session_id: sessionId },
            order: { created_at: 'DESC' },
            take: limit,
        });
    }
}
exports.ChatMessageRepository = ChatMessageRepository;
