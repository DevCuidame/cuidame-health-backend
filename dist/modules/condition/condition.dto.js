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
exports.ConditionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class ConditionDto {
    id_paciente;
    discapacidad;
    embarazada;
    cicatrices_descripcion;
    tatuajes_descripcion;
}
exports.ConditionDto = ConditionDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del paciente es requerido' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], ConditionDto.prototype, "id_paciente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La discapacidad debe ser una cadena de texto' }),
    __metadata("design:type", String)
], ConditionDto.prototype, "discapacidad", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El estado de embarazo debe ser una cadena de texto' }),
    __metadata("design:type", String)
], ConditionDto.prototype, "embarazada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción de cicatrices debe ser una cadena de texto' }),
    __metadata("design:type", String)
], ConditionDto.prototype, "cicatrices_descripcion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción de tatuajes debe ser una cadena de texto' }),
    __metadata("design:type", String)
], ConditionDto.prototype, "tatuajes_descripcion", void 0);
