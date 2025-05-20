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
exports.Allergy = void 0;
const patient_model_1 = require("./patient.model");
const typeorm_1 = require("typeorm");
let Allergy = class Allergy {
    id;
    id_paciente;
    tipo_alergia;
    descripcion;
    created_at;
    updated_at;
    // Relaciones
    patient;
};
exports.Allergy = Allergy;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Allergy.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Allergy.prototype, "id_paciente", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Allergy.prototype, "tipo_alergia", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 1000 }),
    __metadata("design:type", String)
], Allergy.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Allergy.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Allergy.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_model_1.Patient, Patient => Patient.allergies),
    (0, typeorm_1.JoinColumn)({ name: 'id_paciente' }),
    __metadata("design:type", patient_model_1.Patient)
], Allergy.prototype, "patient", void 0);
exports.Allergy = Allergy = __decorate([
    (0, typeorm_1.Entity)('alergias')
], Allergy);
