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
exports.Availability = exports.DayOfWeek = void 0;
// src/models/availability.model.ts
const typeorm_1 = require("typeorm");
const health_professional_model_1 = require("./health-professional.model");
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["MONDAY"] = "monday";
    DayOfWeek["TUESDAY"] = "tuesday";
    DayOfWeek["WEDNESDAY"] = "wednesday";
    DayOfWeek["THURSDAY"] = "thursday";
    DayOfWeek["FRIDAY"] = "friday";
    DayOfWeek["SATURDAY"] = "saturday";
    DayOfWeek["SUNDAY"] = "sunday";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
let Availability = class Availability {
    id;
    professional_id;
    day_of_week;
    start_time;
    end_time;
    is_active;
    created_at;
    updated_at;
    // Relaciones
    professional;
};
exports.Availability = Availability;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Availability.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Availability.prototype, "professional_id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DayOfWeek
    }),
    __metadata("design:type", String)
], Availability.prototype, "day_of_week", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], Availability.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], Availability.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Availability.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Availability.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Availability.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => health_professional_model_1.HealthProfessional, professional => professional.id),
    (0, typeorm_1.JoinColumn)({ name: 'professional_id' }),
    __metadata("design:type", health_professional_model_1.HealthProfessional)
], Availability.prototype, "professional", void 0);
exports.Availability = Availability = __decorate([
    (0, typeorm_1.Entity)('availabilities')
], Availability);
