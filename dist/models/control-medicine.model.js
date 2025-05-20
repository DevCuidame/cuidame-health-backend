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
exports.MedicineChangesHistory = exports.FileMedicine = exports.ControlMedicine = void 0;
const typeorm_1 = require("typeorm");
const patient_model_1 = require("./patient.model");
let ControlMedicine = class ControlMedicine {
    id;
    medicament_name;
    date_order;
    duration;
    dose;
    frequency;
    quantity;
    authorized;
    mipres;
    controlled_substances;
    eps_authorization;
    pharmacy;
    date_auth;
    phone;
    address;
    description;
    delivery_status;
    delivery_date;
    comments;
    id_patient;
    // Relaciones
    patient;
    files;
};
exports.ControlMedicine = ControlMedicine;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], ControlMedicine.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ControlMedicine.prototype, "medicament_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], ControlMedicine.prototype, "date_order", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ControlMedicine.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ControlMedicine.prototype, "dose", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ControlMedicine.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ControlMedicine.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ControlMedicine.prototype, "authorized", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ControlMedicine.prototype, "mipres", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ControlMedicine.prototype, "controlled_substances", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ControlMedicine.prototype, "eps_authorization", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ControlMedicine.prototype, "pharmacy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ControlMedicine.prototype, "date_auth", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ControlMedicine.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], ControlMedicine.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], ControlMedicine.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ControlMedicine.prototype, "delivery_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], ControlMedicine.prototype, "delivery_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text' }),
    __metadata("design:type", String)
], ControlMedicine.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ControlMedicine.prototype, "id_patient", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => patient_model_1.Patient, patient => patient.medicines),
    (0, typeorm_1.JoinColumn)({ name: 'id_patient' }),
    __metadata("design:type", patient_model_1.Patient)
], ControlMedicine.prototype, "patient", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => FileMedicine, fileMedicine => fileMedicine.order),
    __metadata("design:type", Array)
], ControlMedicine.prototype, "files", void 0);
exports.ControlMedicine = ControlMedicine = __decorate([
    (0, typeorm_1.Entity)('controlMedicines')
], ControlMedicine);
let FileMedicine = class FileMedicine {
    id;
    name;
    path;
    category;
    id_order;
    created_at;
    base64;
    // Relaciones
    order;
};
exports.FileMedicine = FileMedicine;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], FileMedicine.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FileMedicine.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], FileMedicine.prototype, "path", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], FileMedicine.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], FileMedicine.prototype, "id_order", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], FileMedicine.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'text', default: '' }),
    __metadata("design:type", String)
], FileMedicine.prototype, "base64", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ControlMedicine, order => order.files),
    (0, typeorm_1.JoinColumn)({ name: 'id_order' }),
    __metadata("design:type", ControlMedicine)
], FileMedicine.prototype, "order", void 0);
exports.FileMedicine = FileMedicine = __decorate([
    (0, typeorm_1.Entity)('filemedicine')
], FileMedicine);
let MedicineChangesHistory = class MedicineChangesHistory {
    id;
    table_name;
    record_id;
    change_type;
    changed_at;
    user_name;
    old_data;
    new_data;
};
exports.MedicineChangesHistory = MedicineChangesHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], MedicineChangesHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MedicineChangesHistory.prototype, "table_name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], MedicineChangesHistory.prototype, "record_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], MedicineChangesHistory.prototype, "change_type", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MedicineChangesHistory.prototype, "changed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], MedicineChangesHistory.prototype, "user_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], MedicineChangesHistory.prototype, "old_data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], MedicineChangesHistory.prototype, "new_data", void 0);
exports.MedicineChangesHistory = MedicineChangesHistory = __decorate([
    (0, typeorm_1.Entity)('medicine_changes_history')
], MedicineChangesHistory);
