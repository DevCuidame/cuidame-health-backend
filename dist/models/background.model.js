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
exports.Vaccine = exports.FamilyBackground = exports.Background = void 0;
const typeorm_1 = require("typeorm");
const patient_model_1 = require("./patient.model");
// Modelo para antecedentes médicos
let Background = class Background {
    id;
    id_paciente;
    tipo_antecedente;
    descripcion_antecedente;
    fecha_antecedente;
    created_at;
    updated_at;
    // Relaciones
    patient;
};
exports.Background = Background;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Background.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Background.prototype, "id_paciente", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Background.prototype, "tipo_antecedente", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 1000 }),
    __metadata("design:type", String)
], Background.prototype, "descripcion_antecedente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Background.prototype, "fecha_antecedente", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Background.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Background.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_model_1.Patient, patient => patient.backgrounds),
    (0, typeorm_1.JoinColumn)({ name: 'id_paciente' }),
    __metadata("design:type", patient_model_1.Patient)
], Background.prototype, "patient", void 0);
exports.Background = Background = __decorate([
    (0, typeorm_1.Entity)('antecedentes')
], Background);
// Modelo para antecedentes familiares
let FamilyBackground = class FamilyBackground {
    id;
    id_paciente;
    tipo_antecedente;
    parentesco;
    descripcion_antecedente;
    created_at;
    updated_at;
    // Relaciones
    patient;
};
exports.FamilyBackground = FamilyBackground;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], FamilyBackground.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FamilyBackground.prototype, "id_paciente", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FamilyBackground.prototype, "tipo_antecedente", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], FamilyBackground.prototype, "parentesco", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 1000 }),
    __metadata("design:type", String)
], FamilyBackground.prototype, "descripcion_antecedente", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FamilyBackground.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], FamilyBackground.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_model_1.Patient, patient => patient.familyBackgrounds),
    (0, typeorm_1.JoinColumn)({ name: 'id_paciente' }),
    __metadata("design:type", patient_model_1.Patient)
], FamilyBackground.prototype, "patient", void 0);
exports.FamilyBackground = FamilyBackground = __decorate([
    (0, typeorm_1.Entity)('atecedentes_familiares')
], FamilyBackground);
// Modelo para vacunas
let Vaccine = class Vaccine {
    id;
    id_paciente;
    vacuna;
    created_at;
    updated_at;
    // Relaciones
    patient;
};
exports.Vaccine = Vaccine;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Vaccine.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Vaccine.prototype, "id_paciente", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Vaccine.prototype, "vacuna", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Vaccine.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Vaccine.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_model_1.Patient, patient => patient.vaccines),
    (0, typeorm_1.JoinColumn)({ name: 'id_paciente' }),
    __metadata("design:type", patient_model_1.Patient)
], Vaccine.prototype, "patient", void 0);
exports.Vaccine = Vaccine = __decorate([
    (0, typeorm_1.Entity)('vacunas')
], Vaccine);
