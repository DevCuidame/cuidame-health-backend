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
exports.UpdateContactDto = exports.CreateContactDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateContactDto {
    nombre1;
    telefono1;
    nombre2;
    telefono2;
    nombre3;
    telefono3;
}
exports.CreateContactDto = CreateContactDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El nombre del primer contacto debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "nombre1", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El teléfono del primer contacto debe ser una cadena de texto' }),
    (0, class_validator_1.Matches)(/^\d{7,15}$/, { message: 'El teléfono debe contener entre 7 y 15 dígitos numéricos' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "telefono1", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El nombre del segundo contacto debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "nombre2", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El teléfono del segundo contacto debe ser una cadena de texto' }),
    (0, class_validator_1.Matches)(/^\d{7,15}$/, { message: 'El teléfono debe contener entre 7 y 15 dígitos numéricos' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "telefono2", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El nombre del tercer contacto debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "nombre3", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El teléfono del tercer contacto debe ser una cadena de texto' }),
    (0, class_validator_1.Matches)(/^\d{7,15}$/, { message: 'El teléfono debe contener entre 7 y 15 dígitos numéricos' }),
    __metadata("design:type", String)
], CreateContactDto.prototype, "telefono3", void 0);
class UpdateContactDto extends CreateContactDto {
    id;
}
exports.UpdateContactDto = UpdateContactDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del contacto debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateContactDto.prototype, "id", void 0);
