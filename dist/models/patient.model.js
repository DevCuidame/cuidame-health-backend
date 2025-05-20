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
exports.Patient = void 0;
const typeorm_1 = require("typeorm");
const allergy_model_1 = require("./allergy.model");
const condition_model_1 = require("./condition.model");
const background_model_1 = require("./background.model");
const vitals_models_1 = require("./vitals.models");
const control_medicine_model_1 = require("./control-medicine.model");
const user_model_1 = require("./user.model");
const diseases_model_1 = require("./diseases.model");
let Patient = class Patient {
    id;
    code;
    nombre;
    apellido;
    tipoid;
    numeroid;
    telefono;
    fecha_nacimiento;
    genero;
    ciudad;
    departamento;
    direccion;
    rh;
    eps;
    prepagada;
    arl;
    seguro_funerario;
    a_cargo_id;
    image;
    city_id;
    public_name;
    created_at;
    updated_at;
    photourl;
    imagebs64;
    // Relaciones
    caregiver;
    allergies;
    conditions;
    diseases;
    familyBackgrounds;
    backgrounds;
    heartRates;
    bloodPressures;
    bloodGlucoses;
    bloodOxygens;
    respiratoryRates;
    vaccines;
    medicines;
};
exports.Patient = Patient;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Patient.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Patient.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Patient.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Patient.prototype, "apellido", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Patient.prototype, "tipoid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Patient.prototype, "numeroid", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Patient.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Patient.prototype, "fecha_nacimiento", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Patient.prototype, "genero", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Patient.prototype, "ciudad", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Patient.prototype, "departamento", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Patient.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Patient.prototype, "rh", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "eps", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "prepagada", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "arl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "seguro_funerario", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Patient.prototype, "a_cargo_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "image", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Patient.prototype, "city_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "public_name", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Patient.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Patient.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Patient.prototype, "photourl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", Object)
], Patient.prototype, "imagebs64", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_model_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'a_cargo_id' }),
    __metadata("design:type", user_model_1.User)
], Patient.prototype, "caregiver", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => allergy_model_1.Allergy, (allergy) => allergy.patient),
    __metadata("design:type", Array)
], Patient.prototype, "allergies", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => condition_model_1.Condition, (condition) => condition.patient),
    __metadata("design:type", Array)
], Patient.prototype, "conditions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => diseases_model_1.Disease, (disease) => disease.patient),
    __metadata("design:type", Array)
], Patient.prototype, "diseases", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => background_model_1.FamilyBackground, (familyBackground) => familyBackground.patient),
    __metadata("design:type", Array)
], Patient.prototype, "familyBackgrounds", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => background_model_1.Background, (background) => background.patient),
    __metadata("design:type", Array)
], Patient.prototype, "backgrounds", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vitals_models_1.HeartRate, (heartRate) => heartRate.patient),
    __metadata("design:type", Array)
], Patient.prototype, "heartRates", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vitals_models_1.BloodPressure, (bloodPressure) => bloodPressure.patient),
    __metadata("design:type", Array)
], Patient.prototype, "bloodPressures", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vitals_models_1.BloodGlucose, (bloodGlucose) => bloodGlucose.patient),
    __metadata("design:type", Array)
], Patient.prototype, "bloodGlucoses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vitals_models_1.BloodOxygen, (bloodOxygen) => bloodOxygen.patient),
    __metadata("design:type", Array)
], Patient.prototype, "bloodOxygens", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => vitals_models_1.RespiratoryRate, (respiratoryRate) => respiratoryRate.patient),
    __metadata("design:type", Array)
], Patient.prototype, "respiratoryRates", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => background_model_1.Vaccine, (vaccine) => vaccine.patient),
    __metadata("design:type", Array)
], Patient.prototype, "vaccines", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => control_medicine_model_1.ControlMedicine, (controlMedicine) => controlMedicine.patient),
    __metadata("design:type", Array)
], Patient.prototype, "medicines", void 0);
exports.Patient = Patient = __decorate([
    (0, typeorm_1.Entity)('pacientes')
], Patient);
