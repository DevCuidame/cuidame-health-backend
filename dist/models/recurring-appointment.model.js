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
exports.RecurringAppointment = exports.RecurrenceEndType = exports.RecurrencePattern = void 0;
// src/models/recurring-appointment.model.ts
const typeorm_1 = require("typeorm");
const health_professional_model_1 = require("./health-professional.model");
const patient_model_1 = require("./patient.model");
const appointment_type_model_1 = require("./appointment-type.model");
const appointment_model_1 = require("./appointment.model");
var RecurrencePattern;
(function (RecurrencePattern) {
    RecurrencePattern["DAILY"] = "daily";
    RecurrencePattern["WEEKLY"] = "weekly";
    RecurrencePattern["BIWEEKLY"] = "biweekly";
    RecurrencePattern["MONTHLY"] = "monthly";
    RecurrencePattern["CUSTOM"] = "custom";
})(RecurrencePattern || (exports.RecurrencePattern = RecurrencePattern = {}));
var RecurrenceEndType;
(function (RecurrenceEndType) {
    RecurrenceEndType["NEVER"] = "never";
    RecurrenceEndType["AFTER_OCCURRENCES"] = "after_occurrences";
    RecurrenceEndType["ON_DATE"] = "on_date";
})(RecurrenceEndType || (exports.RecurrenceEndType = RecurrenceEndType = {}));
let RecurringAppointment = class RecurringAppointment {
    id;
    patient_id;
    professional_id;
    appointment_type_id;
    start_time; // Hora de inicio de la primera cita
    end_time; // Hora de fin de la primera cita
    recurrence_pattern;
    recurrence_interval; // Intervalo de recurrencia (cada X días/semanas/meses)
    days_of_week; // Para recurrencia semanal (0-6, donde 0 es domingo)
    day_of_month; // Para recurrencia mensual
    end_type;
    occurrences; // Número de ocurrencias si end_type es AFTER_OCCURRENCES
    end_date; // Fecha de fin si end_type es ON_DATE
    is_active;
    notes;
    modified_by_id; // ID del usuario que modificó la recurrencia por última vez
    created_at;
    updated_at;
    // Relaciones
    patient;
    professional;
    appointmentType;
    appointments;
};
exports.RecurringAppointment = RecurringAppointment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], RecurringAppointment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], RecurringAppointment.prototype, "patient_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], RecurringAppointment.prototype, "professional_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], RecurringAppointment.prototype, "appointment_type_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], RecurringAppointment.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], RecurringAppointment.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RecurrencePattern,
        default: RecurrencePattern.WEEKLY
    }),
    __metadata("design:type", String)
], RecurringAppointment.prototype, "recurrence_pattern", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], RecurringAppointment.prototype, "recurrence_interval", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], RecurringAppointment.prototype, "days_of_week", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RecurringAppointment.prototype, "day_of_month", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: RecurrenceEndType,
        default: RecurrenceEndType.AFTER_OCCURRENCES
    }),
    __metadata("design:type", String)
], RecurringAppointment.prototype, "end_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RecurringAppointment.prototype, "occurrences", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RecurringAppointment.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RecurringAppointment.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 1000 }),
    __metadata("design:type", String)
], RecurringAppointment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], RecurringAppointment.prototype, "modified_by_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RecurringAppointment.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RecurringAppointment.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_model_1.Patient),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_model_1.Patient)
], RecurringAppointment.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => health_professional_model_1.HealthProfessional),
    (0, typeorm_1.JoinColumn)({ name: 'professional_id' }),
    __metadata("design:type", health_professional_model_1.HealthProfessional)
], RecurringAppointment.prototype, "professional", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appointment_type_model_1.AppointmentType),
    (0, typeorm_1.JoinColumn)({ name: 'appointment_type_id' }),
    __metadata("design:type", appointment_type_model_1.AppointmentType)
], RecurringAppointment.prototype, "appointmentType", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => appointment_model_1.Appointment, appointment => appointment.recurring_appointment),
    __metadata("design:type", Array)
], RecurringAppointment.prototype, "appointments", void 0);
exports.RecurringAppointment = RecurringAppointment = __decorate([
    (0, typeorm_1.Entity)('recurring_appointments')
], RecurringAppointment);
