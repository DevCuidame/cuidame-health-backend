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
exports.TimeBlock = void 0;
// src/models/time-block.model.ts
const typeorm_1 = require("typeorm");
const health_professional_model_1 = require("./health-professional.model");
let TimeBlock = class TimeBlock {
    id;
    professional_id;
    start_time;
    end_time;
    reason;
    is_recurring;
    recurrence_pattern; // JSON string para patrones de recurrencia
    created_at;
    updated_at;
    // Relaciones
    professional;
};
exports.TimeBlock = TimeBlock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], TimeBlock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], TimeBlock.prototype, "professional_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], TimeBlock.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], TimeBlock.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TimeBlock.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], TimeBlock.prototype, "is_recurring", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TimeBlock.prototype, "recurrence_pattern", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TimeBlock.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TimeBlock.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => health_professional_model_1.HealthProfessional),
    (0, typeorm_1.JoinColumn)({ name: 'professional_id' }),
    __metadata("design:type", health_professional_model_1.HealthProfessional)
], TimeBlock.prototype, "professional", void 0);
exports.TimeBlock = TimeBlock = __decorate([
    (0, typeorm_1.Entity)('time_blocks')
], TimeBlock);
