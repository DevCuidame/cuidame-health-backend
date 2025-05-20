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
exports.NotificationDeliveryLog = exports.NotificationQueue = exports.NotificationPreference = exports.NotificationTemplate = void 0;
// src/models/notification-extended.model.ts
const typeorm_1 = require("typeorm");
const notification_model_1 = require("./notification.model");
/**
 * Modelo para plantillas de notificaciones
 */
let NotificationTemplate = class NotificationTemplate {
    id;
    name;
    code;
    type;
    subject;
    body_template;
    variables;
    is_active;
    created_at;
    updated_at;
};
exports.NotificationTemplate = NotificationTemplate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], NotificationTemplate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationTemplate.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationTemplate.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: notification_model_1.NotificationType
    }),
    __metadata("design:type", String)
], NotificationTemplate.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationTemplate.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], NotificationTemplate.prototype, "body_template", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], NotificationTemplate.prototype, "variables", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationTemplate.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationTemplate.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], NotificationTemplate.prototype, "updated_at", void 0);
exports.NotificationTemplate = NotificationTemplate = __decorate([
    (0, typeorm_1.Entity)('notification_templates')
], NotificationTemplate);
/**
 * Modelo para preferencias de notificaciones de usuarios
 */
let NotificationPreference = class NotificationPreference {
    id;
    user_id;
    notification_type;
    email_enabled;
    push_enabled;
    inapp_enabled;
    created_at;
    updated_at;
};
exports.NotificationPreference = NotificationPreference;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], NotificationPreference.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], NotificationPreference.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: notification_model_1.NotificationType
    }),
    __metadata("design:type", String)
], NotificationPreference.prototype, "notification_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "email_enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "push_enabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], NotificationPreference.prototype, "inapp_enabled", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationPreference.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], NotificationPreference.prototype, "updated_at", void 0);
exports.NotificationPreference = NotificationPreference = __decorate([
    (0, typeorm_1.Entity)('notification_preferences')
], NotificationPreference);
/**
 * Modelo para la cola de notificaciones
 */
let NotificationQueue = class NotificationQueue {
    id;
    notification_id;
    delivery_type; // 'email', 'push', 'inapp'
    payload;
    status;
    retries;
    max_retries;
    next_retry;
    error;
    created_at;
    updated_at;
    notification;
};
exports.NotificationQueue = NotificationQueue;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], NotificationQueue.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], NotificationQueue.prototype, "notification_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationQueue.prototype, "delivery_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], NotificationQueue.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    }),
    __metadata("design:type", String)
], NotificationQueue.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], NotificationQueue.prototype, "retries", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 3 }),
    __metadata("design:type", Number)
], NotificationQueue.prototype, "max_retries", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], NotificationQueue.prototype, "next_retry", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], NotificationQueue.prototype, "error", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationQueue.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], NotificationQueue.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => notification_model_1.Notification, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'notification_id' }),
    __metadata("design:type", notification_model_1.Notification)
], NotificationQueue.prototype, "notification", void 0);
exports.NotificationQueue = NotificationQueue = __decorate([
    (0, typeorm_1.Entity)('notification_queue')
], NotificationQueue);
/**
 * Modelo para registrar eventos de entrega de notificaciones
 */
let NotificationDeliveryLog = class NotificationDeliveryLog {
    id;
    notification_id;
    delivery_type; // 'email', 'push', 'inapp'
    status;
    details;
    recipient;
    created_at;
    notification;
};
exports.NotificationDeliveryLog = NotificationDeliveryLog;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], NotificationDeliveryLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], NotificationDeliveryLog.prototype, "notification_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], NotificationDeliveryLog.prototype, "delivery_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['success', 'failure'],
        default: 'success'
    }),
    __metadata("design:type", String)
], NotificationDeliveryLog.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], NotificationDeliveryLog.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NotificationDeliveryLog.prototype, "recipient", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], NotificationDeliveryLog.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => notification_model_1.Notification, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'notification_id' }),
    __metadata("design:type", notification_model_1.Notification)
], NotificationDeliveryLog.prototype, "notification", void 0);
exports.NotificationDeliveryLog = NotificationDeliveryLog = __decorate([
    (0, typeorm_1.Entity)('notification_delivery_logs')
], NotificationDeliveryLog);
