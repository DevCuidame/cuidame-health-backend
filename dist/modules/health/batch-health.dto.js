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
exports.BatchDiseasesDto = exports.CreateDiseaseItemDto = exports.BatchFamilyBackgroundsDto = exports.CreateFamilyBackgroundItemDto = exports.BatchBackgroundsDto = exports.CreateBackgroundItemDto = exports.BatchAllergiesDto = exports.CreateAllergyItemDto = exports.BatchVaccinesDto = exports.CreateVaccineItemDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
// DTO para múltiples vacunas
class CreateVaccineItemDto {
    vacuna;
}
exports.CreateVaccineItemDto = CreateVaccineItemDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre de la vacuna debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateVaccineItemDto.prototype, "vacuna", void 0);
class BatchVaccinesDto {
    id_paciente;
    vacunas;
}
exports.BatchVaccinesDto = BatchVaccinesDto;
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BatchVaccinesDto.prototype, "id_paciente", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Debe proporcionar un array de vacunas' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateVaccineItemDto),
    __metadata("design:type", Array)
], BatchVaccinesDto.prototype, "vacunas", void 0);
// DTO para múltiples alergias
class CreateAllergyItemDto {
    tipo_alergia;
    descripcion;
}
exports.CreateAllergyItemDto = CreateAllergyItemDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El tipo de alergia debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateAllergyItemDto.prototype, "tipo_alergia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateAllergyItemDto.prototype, "descripcion", void 0);
class BatchAllergiesDto {
    id_paciente;
    alergias;
}
exports.BatchAllergiesDto = BatchAllergiesDto;
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BatchAllergiesDto.prototype, "id_paciente", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Debe proporcionar un array de alergias' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateAllergyItemDto),
    __metadata("design:type", Array)
], BatchAllergiesDto.prototype, "alergias", void 0);
// DTO para múltiples antecedentes médicos
class CreateBackgroundItemDto {
    tipo_antecedente;
    descripcion_antecedente;
    fecha_antecedente;
}
exports.CreateBackgroundItemDto = CreateBackgroundItemDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El tipo de antecedente debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateBackgroundItemDto.prototype, "tipo_antecedente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción del antecedente debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateBackgroundItemDto.prototype, "descripcion_antecedente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)({}, { message: 'La fecha del antecedente debe tener un formato válido (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], CreateBackgroundItemDto.prototype, "fecha_antecedente", void 0);
class BatchBackgroundsDto {
    id_paciente;
    antecedentes;
}
exports.BatchBackgroundsDto = BatchBackgroundsDto;
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BatchBackgroundsDto.prototype, "id_paciente", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Debe proporcionar un array de antecedentes' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateBackgroundItemDto),
    __metadata("design:type", Array)
], BatchBackgroundsDto.prototype, "antecedentes", void 0);
// DTO para múltiples antecedentes familiares
class CreateFamilyBackgroundItemDto {
    tipo_antecedente;
    parentesco;
    descripcion_antecedente;
}
exports.CreateFamilyBackgroundItemDto = CreateFamilyBackgroundItemDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El tipo de antecedente debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateFamilyBackgroundItemDto.prototype, "tipo_antecedente", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'El parentesco debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateFamilyBackgroundItemDto.prototype, "parentesco", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción del antecedente debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateFamilyBackgroundItemDto.prototype, "descripcion_antecedente", void 0);
class BatchFamilyBackgroundsDto {
    id_paciente;
    antecedentes_familiares;
}
exports.BatchFamilyBackgroundsDto = BatchFamilyBackgroundsDto;
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BatchFamilyBackgroundsDto.prototype, "id_paciente", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Debe proporcionar un array de antecedentes familiares' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateFamilyBackgroundItemDto),
    __metadata("design:type", Array)
], BatchFamilyBackgroundsDto.prototype, "antecedentes_familiares", void 0);
class CreateDiseaseItemDto {
    enfermedad;
}
exports.CreateDiseaseItemDto = CreateDiseaseItemDto;
__decorate([
    (0, class_validator_1.IsString)({ message: 'El nombre de la enfermedad debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateDiseaseItemDto.prototype, "enfermedad", void 0);
class BatchDiseasesDto {
    id_paciente;
    enfermedades;
}
exports.BatchDiseasesDto = BatchDiseasesDto;
__decorate([
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], BatchDiseasesDto.prototype, "id_paciente", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'Debe proporcionar un array de enfermedades' }),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => CreateDiseaseItemDto),
    __metadata("design:type", Array)
], BatchDiseasesDto.prototype, "enfermedades", void 0);
