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
exports.AppointmentType = void 0;
// src/models/appointment-type.model.ts
const typeorm_1 = require("typeorm");
const appointment_model_1 = require("./appointment.model");
let AppointmentType = class AppointmentType {
    id;
    name;
    description;
    default_duration;
    is_active;
    color_code;
    created_at;
    updated_at;
    // Relaciones
    appointments;
};
exports.AppointmentType = AppointmentType;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], AppointmentType.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], AppointmentType.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 1000 }),
    __metadata("design:type", String)
], AppointmentType.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 30 }),
    __metadata("design:type", Number)
], AppointmentType.prototype, "default_duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], AppointmentType.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], AppointmentType.prototype, "color_code", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], AppointmentType.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], AppointmentType.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => appointment_model_1.Appointment, appointment => appointment.appointmentType),
    __metadata("design:type", Array)
], AppointmentType.prototype, "appointments", void 0);
exports.AppointmentType = AppointmentType = __decorate([
    (0, typeorm_1.Entity)('appointment_types')
], AppointmentType);
