// src/modules/chat/repositories/chat-message.repository.ts

import { ChatMessage } from '../../models/chat-message.model';
import { BaseRepository } from '../../core/repositories/base.repository';

export class ChatMessageRepository extends BaseRepository<ChatMessage> {
  constructor() {
    super(ChatMessage);
  }

  /**
   * Find messages by session ID
   */
  async findBySessionId(sessionId: string): Promise<ChatMessage[]> {
    return await this.repository.find({
      where: { session_id: sessionId },
      order: { created_at: 'ASC' },
    });
  }

  /**
   * Get most recent conversation for a session
   */
  async getRecentMessages(
    sessionId: string,
    limit: number = 10
  ): Promise<ChatMessage[]> {
    return await this.repository.find({
      where: { session_id: sessionId },
      order: { created_at: 'DESC' },
      take: limit,
    });
  }
}
