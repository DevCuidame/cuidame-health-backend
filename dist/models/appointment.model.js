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
exports.Appointment = exports.AppointmentStatus = void 0;
// src/models/appointment.model.ts
const typeorm_1 = require("typeorm");
const patient_model_1 = require("./patient.model");
const health_professional_model_1 = require("./health-professional.model");
const appointment_type_model_1 = require("./appointment-type.model");
const recurring_appointment_model_1 = require("./recurring-appointment.model");
const medical_specialties_model_1 = require("./medical-specialties.model");
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["REQUESTED"] = "requested";
    AppointmentStatus["CONFIRMED"] = "confirmed";
    AppointmentStatus["COMPLETED"] = "completed";
    AppointmentStatus["CANCELLED"] = "cancelled";
    AppointmentStatus["RESCHEDULED"] = "rescheduled";
    AppointmentStatus["NO_SHOW"] = "no_show";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
let Appointment = class Appointment {
    id;
    patient_id;
    professional_id;
    appointment_type_id;
    start_time;
    end_time;
    status;
    notes;
    cancellation_reason;
    reminder_sent;
    specialty_id;
    location;
    modified_by_id;
    recurring_appointment_id;
    created_at;
    updated_at;
    // Relaciones
    specialty;
    patient;
    professional;
    appointmentType;
    recurring_appointment;
};
exports.Appointment = Appointment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Appointment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: false }),
    __metadata("design:type", Number)
], Appointment.prototype, "patient_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Appointment.prototype, "professional_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Appointment.prototype, "appointment_type_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Appointment.prototype, "start_time", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Appointment.prototype, "end_time", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.REQUESTED
    }),
    __metadata("design:type", String)
], Appointment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 1000 }),
    __metadata("design:type", String)
], Appointment.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 1000 }),
    __metadata("design:type", String)
], Appointment.prototype, "cancellation_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Appointment.prototype, "reminder_sent", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Appointment.prototype, "specialty_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Appointment.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Appointment.prototype, "modified_by_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Appointment.prototype, "recurring_appointment_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Appointment.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Appointment.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => medical_specialties_model_1.MedicalSpecialties),
    (0, typeorm_1.JoinColumn)({ name: 'specialty_id' }),
    __metadata("design:type", medical_specialties_model_1.MedicalSpecialties)
], Appointment.prototype, "specialty", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_model_1.Patient),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_model_1.Patient)
], Appointment.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => health_professional_model_1.HealthProfessional),
    (0, typeorm_1.JoinColumn)({ name: 'professional_id' }),
    __metadata("design:type", health_professional_model_1.HealthProfessional)
], Appointment.prototype, "professional", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appointment_type_model_1.AppointmentType),
    (0, typeorm_1.JoinColumn)({ name: 'appointment_type_id' }),
    __metadata("design:type", appointment_type_model_1.AppointmentType)
], Appointment.prototype, "appointmentType", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => recurring_appointment_model_1.RecurringAppointment),
    (0, typeorm_1.JoinColumn)({ name: 'recurring_appointment_id' }),
    __metadata("design:type", recurring_appointment_model_1.RecurringAppointment)
], Appointment.prototype, "recurring_appointment", void 0);
exports.Appointment = Appointment = __decorate([
    (0, typeorm_1.Entity)('appointments')
], Appointment);
