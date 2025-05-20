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
exports.UpdateFileMedicineDto = exports.CreateFileMedicineDto = exports.UpdateMedicineDto = exports.CreateMedicineDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateMedicineDto {
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
}
exports.CreateMedicineDto = CreateMedicineDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre del medicamento es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El nombre del medicamento debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "medicament_name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La fecha de orden es requerida' }),
    (0, class_validator_1.IsISO8601)({}, { message: 'La fecha de orden debe tener un formato válido (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "date_order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La duración debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La dosis debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "dose", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La frecuencia debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "frequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La cantidad debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El campo autorizado debe ser un valor booleano' }),
    __metadata("design:type", Boolean)
], CreateMedicineDto.prototype, "authorized", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El campo MIPRES debe ser un valor booleano' }),
    __metadata("design:type", Boolean)
], CreateMedicineDto.prototype, "mipres", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El campo sustancias controladas debe ser un valor booleano' }),
    __metadata("design:type", Boolean)
], CreateMedicineDto.prototype, "controlled_substances", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El campo autorización EPS debe ser un valor booleano' }),
    __metadata("design:type", Boolean)
], CreateMedicineDto.prototype, "eps_authorization", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La farmacia debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "pharmacy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)({}, { message: 'La fecha de autorización debe tener un formato válido (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "date_auth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El teléfono debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La dirección debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El estado de entrega debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "delivery_status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)({}, { message: 'La fecha de entrega debe tener un formato válido (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "delivery_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Los comentarios deben ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateMedicineDto.prototype, "comments", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del paciente es requerido' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateMedicineDto.prototype, "id_patient", void 0);
class UpdateMedicineDto {
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
}
exports.UpdateMedicineDto = UpdateMedicineDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El nombre del medicamento debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "medicament_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)({}, { message: 'La fecha de orden debe tener un formato válido (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "date_order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La duración debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La dosis debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "dose", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La frecuencia debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "frequency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La cantidad debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El campo autorizado debe ser un valor booleano' }),
    __metadata("design:type", Boolean)
], UpdateMedicineDto.prototype, "authorized", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El campo MIPRES debe ser un valor booleano' }),
    __metadata("design:type", Boolean)
], UpdateMedicineDto.prototype, "mipres", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El campo sustancias controladas debe ser un valor booleano' }),
    __metadata("design:type", Boolean)
], UpdateMedicineDto.prototype, "controlled_substances", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El campo autorización EPS debe ser un valor booleano' }),
    __metadata("design:type", Boolean)
], UpdateMedicineDto.prototype, "eps_authorization", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La farmacia debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "pharmacy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)({}, { message: 'La fecha de autorización debe tener un formato válido (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "date_auth", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El teléfono debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La dirección debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El estado de entrega debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "delivery_status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)({}, { message: 'La fecha de entrega debe tener un formato válido (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "delivery_date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Los comentarios deben ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateMedicineDto.prototype, "comments", void 0);
class CreateFileMedicineDto {
    name;
    path;
    category;
    id_order;
    base64;
}
exports.CreateFileMedicineDto = CreateFileMedicineDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre del archivo es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El nombre del archivo debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateFileMedicineDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La ruta del archivo es requerida' }),
    (0, class_validator_1.IsString)({ message: 'La ruta del archivo debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateFileMedicineDto.prototype, "path", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La categoría del archivo es requerida' }),
    (0, class_validator_1.IsString)({ message: 'La categoría del archivo debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateFileMedicineDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID de la orden es requerido' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID de la orden debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateFileMedicineDto.prototype, "id_order", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El base64 debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateFileMedicineDto.prototype, "base64", void 0);
class UpdateFileMedicineDto {
    name;
    path;
    category;
    base64;
}
exports.UpdateFileMedicineDto = UpdateFileMedicineDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El nombre del archivo debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateFileMedicineDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La ruta del archivo debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateFileMedicineDto.prototype, "path", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La categoría del archivo debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateFileMedicineDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El base64 debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateFileMedicineDto.prototype, "base64", void 0);
