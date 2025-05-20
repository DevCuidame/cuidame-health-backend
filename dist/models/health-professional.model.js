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
exports.HealthProfessional = void 0;
// src/models/health-professional.model.ts
const typeorm_1 = require("typeorm");
const user_model_1 = require("./user.model");
const appointment_model_1 = require("./appointment.model");
let HealthProfessional = class HealthProfessional {
    id;
    user_id;
    specialty;
    license_number;
    bio;
    consultation_fee;
    is_active;
    default_appointment_duration; // en minutos
    created_at;
    updated_at;
    // Relaciones
    user;
    appointments;
};
exports.HealthProfessional = HealthProfessional;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], HealthProfessional.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], HealthProfessional.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HealthProfessional.prototype, "specialty", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], HealthProfessional.prototype, "license_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], HealthProfessional.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], HealthProfessional.prototype, "consultation_fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], HealthProfessional.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 30 }),
    __metadata("design:type", Number)
], HealthProfessional.prototype, "default_appointment_duration", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], HealthProfessional.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], HealthProfessional.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_model_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_model_1.User)
], HealthProfessional.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => appointment_model_1.Appointment, appointment => appointment.professional),
    __metadata("design:type", Array)
], HealthProfessional.prototype, "appointments", void 0);
exports.HealthProfessional = HealthProfessional = __decorate([
    (0, typeorm_1.Entity)('health_professionals')
], HealthProfessional);
