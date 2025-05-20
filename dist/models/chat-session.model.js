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
exports.ChatSession = exports.ChatStepType = exports.ChatSessionStatus = void 0;
// src/modules/chat/models/chat-session.model.ts
const typeorm_1 = require("typeorm");
const patient_model_1 = require("./patient.model");
var ChatSessionStatus;
(function (ChatSessionStatus) {
    ChatSessionStatus["ACTIVE"] = "active";
    ChatSessionStatus["COMPLETED"] = "completed";
    ChatSessionStatus["ABANDONED"] = "abandoned";
})(ChatSessionStatus || (exports.ChatSessionStatus = ChatSessionStatus = {}));
var ChatStepType;
(function (ChatStepType) {
    ChatStepType["VALIDATE_DOCUMENT"] = "validateDocument";
    ChatStepType["SELECT_CITY"] = "selectCity";
    ChatStepType["SELECT_SPECIALTY"] = "selectSpecialty";
    ChatStepType["SELECT_APPOINTMENT_TYPE"] = "selectAppointmentType";
    // SELECT_PROFESSIONAL = 'selectProfessional',
    // SELECT_DATE = 'selectDate',
    // SELECT_TIME = 'selectTime',
    ChatStepType["CONFIRM_APPOINTMENT"] = "confirmAppointment";
    ChatStepType["COMPLETED"] = "completed";
})(ChatStepType || (exports.ChatStepType = ChatStepType = {}));
let ChatSession = class ChatSession {
    id;
    session_id;
    patient_id;
    patient;
    document_number;
    current_step;
    chat_data;
    status;
    appointment_id;
    created_at;
    updated_at;
    last_interaction_at;
};
exports.ChatSession = ChatSession;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ChatSession.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], ChatSession.prototype, "session_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ChatSession.prototype, "patient_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_model_1.Patient),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_model_1.Patient)
], ChatSession.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ChatSession.prototype, "document_number", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ChatStepType,
        default: ChatStepType.VALIDATE_DOCUMENT
    }),
    __metadata("design:type", String)
], ChatSession.prototype, "current_step", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], ChatSession.prototype, "chat_data", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ChatSessionStatus,
        default: ChatSessionStatus.ACTIVE
    }),
    __metadata("design:type", String)
], ChatSession.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ChatSession.prototype, "appointment_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ChatSession.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ChatSession.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ChatSession.prototype, "last_interaction_at", void 0);
exports.ChatSession = ChatSession = __decorate([
    (0, typeorm_1.Entity)('chat_sessions')
], ChatSession);
