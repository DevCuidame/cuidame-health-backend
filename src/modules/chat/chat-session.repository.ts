import { ChatSession, ChatSessionStatus } from "../../models/chat-session.model";
import { BaseRepository } from "../../core/repositories/base.repository";

// src/modules/chat/repositories/chat-session.repository.ts
export class ChatSessionRepository extends BaseRepository<ChatSession> {
  constructor() {
    super(ChatSession);
  }

  /**
   * Find a session by its unique session ID
   */
  async findBySessionId(sessionId: string): Promise<ChatSession | null> {
    return await this.repository.findOne({
      where: { session_id: sessionId },
    });
  }
  /**
   * Find active sessions for a patient by document number
   */
  async findActiveByDocument(documentNumber: string): Promise<ChatSession | null> {
    return await this.repository.findOne({
      where: { 
        document_number: documentNumber, 
        status: ChatSessionStatus.ACTIVE  
      },
      order: { created_at: 'DESC' }
    });
  }

  /**
   * Delete all chat sessions for a patient
   * @param patientId ID of the patient
   * @returns True if successful
   */
  async deleteByPatientId(patientId: number): Promise<boolean> {
    const result = await this.repository.delete({ patient_id: patientId });
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }
}
