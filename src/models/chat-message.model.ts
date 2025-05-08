  // src/modules/chat/models/chat-message.model.ts
  import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
  } from 'typeorm';
  import { ChatSession } from './chat-session.model';
  
  export enum MessageDirection {
    INCOMING = 'incoming',
    OUTGOING = 'outgoing'
  }
  
  @Entity('chat_messages')
  export class ChatMessage {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @Column()
    session_id!: string;
  
    @ManyToOne(() => ChatSession, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'session_id', referencedColumnName: 'session_id' })
    session!: ChatSession;
  
    @Column({
      type: 'enum',
      enum: MessageDirection
    })
    direction!: MessageDirection;
  
    @Column({ type: 'text' })
    message_content!: string;
  
    @Column({ type: 'json', nullable: true })
    metadata: any;
  
    @CreateDateColumn()
    created_at!: Date;
  }
  