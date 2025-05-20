"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatMessage = exports.MessageDirection = void 0;
// src/modules/chat/models/chat-message.model.ts
const typeorm_1 = require("typeorm");
const chat_session_model_1 = require("./chat-session.model");
var MessageDirection;
(function (MessageDirection) {
    MessageDirection["INCOMING"] = "incoming";
    MessageDirection["OUTGOING"] = "outgoing";
})(MessageDirection || (exports.MessageDirection = MessageDirection = {}));
let ChatMessage = class ChatMessage {
    id;
    session_id;
    session;
    direction;
    message_content;
    metadata;
    created_at;
};
exports.ChatMessage = ChatMessage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ChatMessage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ChatMessage.prototype, "session_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => chat_session_model_1.ChatSession, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'session_id', referencedColumnName: 'session_id' }),
    __metadata("design:type", chat_session_model_1.ChatSession)
], ChatMessage.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MessageDirection
    }),
    __metadata("design:type", String)
], ChatMessage.prototype, "direction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ChatMessage.prototype, "message_content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ChatMessage.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChatMessage.prototype, "created_at", void 0);
exports.ChatMessage = ChatMessage = __decorate([
    (0, typeorm_1.Entity)('chat_messages')
], ChatMessage);
