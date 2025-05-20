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
exports.RespiratoryRate = exports.BloodOxygen = exports.BloodGlucose = exports.BloodPressure = exports.HeartRate = void 0;
const typeorm_1 = require("typeorm");
const patient_model_1 = require("./patient.model");
// Modelo para frecuencia cardíaca
let HeartRate = class HeartRate {
    id;
    patient_id;
    rate;
    date;
    created_at;
    // Relaciones
    patient;
};
exports.HeartRate = HeartRate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], HeartRate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], HeartRate.prototype, "patient_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], HeartRate.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], HeartRate.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ nullable: true }),
    __metadata("design:type", Date)
], HeartRate.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_model_1.Patient, patient => patient.heartRates),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_model_1.Patient)
], HeartRate.prototype, "patient", void 0);
exports.HeartRate = HeartRate = __decorate([
    (0, typeorm_1.Entity)('heart_rate')
], HeartRate);
// Modelo para presión arterial
let BloodPressure = class BloodPressure {
    id;
    patient_id;
    systolic;
    diastolic;
    date;
    created_at;
    // Relaciones
    patient;
};
exports.BloodPressure = BloodPressure;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], BloodPressure.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BloodPressure.prototype, "patient_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BloodPressure.prototype, "systolic", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BloodPressure.prototype, "diastolic", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], BloodPressure.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ nullable: true }),
    __metadata("design:type", Date)
], BloodPressure.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_model_1.Patient, patient => patient.bloodPressures),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_model_1.Patient)
], BloodPressure.prototype, "patient", void 0);
exports.BloodPressure = BloodPressure = __decorate([
    (0, typeorm_1.Entity)('blood_pressure')
], BloodPressure);
// Modelo para glucosa en sangre
let BloodGlucose = class BloodGlucose {
    id;
    patient_id;
    rate;
    date;
    // Relaciones
    patient;
};
exports.BloodGlucose = BloodGlucose;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], BloodGlucose.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BloodGlucose.prototype, "patient_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BloodGlucose.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], BloodGlucose.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_model_1.Patient, patient => patient.bloodGlucoses),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_model_1.Patient)
], BloodGlucose.prototype, "patient", void 0);
exports.BloodGlucose = BloodGlucose = __decorate([
    (0, typeorm_1.Entity)('blood_glucose')
], BloodGlucose);
// Modelo para oxígeno en sangre
let BloodOxygen = class BloodOxygen {
    id;
    patient_id;
    rate;
    date;
    // Relaciones
    patient;
};
exports.BloodOxygen = BloodOxygen;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], BloodOxygen.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BloodOxygen.prototype, "patient_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], BloodOxygen.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], BloodOxygen.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_model_1.Patient, patient => patient.bloodOxygens),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_model_1.Patient)
], BloodOxygen.prototype, "patient", void 0);
exports.BloodOxygen = BloodOxygen = __decorate([
    (0, typeorm_1.Entity)('blood_oxygen')
], BloodOxygen);
// Modelo para frecuencia respiratoria
let RespiratoryRate = class RespiratoryRate {
    id;
    patient_id;
    rate;
    date;
    created_at;
    // Relaciones
    patient;
};
exports.RespiratoryRate = RespiratoryRate;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], RespiratoryRate.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], RespiratoryRate.prototype, "patient_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], RespiratoryRate.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], RespiratoryRate.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ nullable: true }),
    __metadata("design:type", Date)
], RespiratoryRate.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_model_1.Patient, patient => patient.respiratoryRates),
    (0, typeorm_1.JoinColumn)({ name: 'patient_id' }),
    __metadata("design:type", patient_model_1.Patient)
], RespiratoryRate.prototype, "patient", void 0);
exports.RespiratoryRate = RespiratoryRate = __decorate([
    (0, typeorm_1.Entity)('respiratory_rate')
], RespiratoryRate);
