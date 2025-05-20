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
exports.UpdateDiseaseDto = exports.CreateDiseaseDto = exports.UpdateVaccineDto = exports.CreateVaccineDto = exports.UpdateFamilyBackgroundDto = exports.CreateFamilyBackgroundDto = exports.UpdateBackgroundDto = exports.CreateBackgroundDto = exports.UpdateConditionDto = exports.CreateConditionDto = exports.UpdateAllergyDto = exports.CreateAllergyDto = exports.CreateRespiratoryRateDto = exports.CreateBloodOxygenDto = exports.CreateBloodGlucoseDto = exports.CreateBloodPressureDto = exports.CreateHeartRateDto = exports.CreateVitalDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
// DTOs para signos vitales
class CreateVitalDto {
    patient_id;
    date;
}
exports.CreateVitalDto = CreateVitalDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del paciente es requerido' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVitalDto.prototype, "patient_id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La fecha es requerida' }),
    (0, class_validator_1.IsISO8601)({}, { message: 'La fecha debe tener un formato válido (YYYY-MM-DD HH:MM:SS)' }),
    __metadata("design:type", String)
], CreateVitalDto.prototype, "date", void 0);
class CreateHeartRateDto extends CreateVitalDto {
    rate;
}
exports.CreateHeartRateDto = CreateHeartRateDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La frecuencia cardíaca es requerida' }),
    (0, class_validator_1.IsNumber)({}, { message: 'La frecuencia cardíaca debe ser un número' }),
    (0, class_validator_1.IsPositive)({ message: 'La frecuencia cardíaca debe ser positiva' }),
    (0, class_validator_1.Min)(30, { message: 'La frecuencia cardíaca mínima es 30 ppm' }),
    (0, class_validator_1.Max)(220, { message: 'La frecuencia cardíaca máxima es 220 ppm' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateHeartRateDto.prototype, "rate", void 0);
class CreateBloodPressureDto extends CreateVitalDto {
    systolic;
    diastolic;
}
exports.CreateBloodPressureDto = CreateBloodPressureDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La presión sistólica es requerida' }),
    (0, class_validator_1.IsNumber)({}, { message: 'La presión sistólica debe ser un número' }),
    (0, class_validator_1.IsPositive)({ message: 'La presión sistólica debe ser positiva' }),
    (0, class_validator_1.Min)(60, { message: 'La presión sistólica mínima es 60 mmHg' }),
    (0, class_validator_1.Max)(250, { message: 'La presión sistólica máxima es 250 mmHg' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBloodPressureDto.prototype, "systolic", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La presión diastólica es requerida' }),
    (0, class_validator_1.IsNumber)({}, { message: 'La presión diastólica debe ser un número' }),
    (0, class_validator_1.IsPositive)({ message: 'La presión diastólica debe ser positiva' }),
    (0, class_validator_1.Min)(40, { message: 'La presión diastólica mínima es 40 mmHg' }),
    (0, class_validator_1.Max)(150, { message: 'La presión diastólica máxima es 150 mmHg' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBloodPressureDto.prototype, "diastolic", void 0);
class CreateBloodGlucoseDto extends CreateVitalDto {
    rate;
}
exports.CreateBloodGlucoseDto = CreateBloodGlucoseDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El nivel de glucosa es requerido' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El nivel de glucosa debe ser un número' }),
    (0, class_validator_1.IsPositive)({ message: 'El nivel de glucosa debe ser positivo' }),
    (0, class_validator_1.Min)(20, { message: 'El nivel de glucosa mínimo es 20 mg/dL' }),
    (0, class_validator_1.Max)(600, { message: 'El nivel de glucosa máximo es 600 mg/dL' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBloodGlucoseDto.prototype, "rate", void 0);
class CreateBloodOxygenDto extends CreateVitalDto {
    rate;
}
exports.CreateBloodOxygenDto = CreateBloodOxygenDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El nivel de oxígeno es requerido' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El nivel de oxígeno debe ser un número' }),
    (0, class_validator_1.IsPositive)({ message: 'El nivel de oxígeno debe ser positivo' }),
    (0, class_validator_1.Min)(50, { message: 'El nivel de oxígeno mínimo es 50%' }),
    (0, class_validator_1.Max)(100, { message: 'El nivel de oxígeno máximo es 100%' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBloodOxygenDto.prototype, "rate", void 0);
class CreateRespiratoryRateDto extends CreateVitalDto {
    rate;
}
exports.CreateRespiratoryRateDto = CreateRespiratoryRateDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La frecuencia respiratoria es requerida' }),
    (0, class_validator_1.IsNumber)({}, { message: 'La frecuencia respiratoria debe ser un número' }),
    (0, class_validator_1.IsPositive)({ message: 'La frecuencia respiratoria debe ser positiva' }),
    (0, class_validator_1.Min)(8, { message: 'La frecuencia respiratoria mínima es 8 respiraciones por minuto' }),
    (0, class_validator_1.Max)(60, { message: 'La frecuencia respiratoria máxima es 60 respiraciones por minuto' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateRespiratoryRateDto.prototype, "rate", void 0);
// DTOs para alergias
class CreateAllergyDto {
    id_paciente;
    tipo_alergia;
    descripcion;
}
exports.CreateAllergyDto = CreateAllergyDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del paciente es requerido' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateAllergyDto.prototype, "id_paciente", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El tipo de alergia es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El tipo de alergia debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateAllergyDto.prototype, "tipo_alergia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateAllergyDto.prototype, "descripcion", void 0);
class UpdateAllergyDto {
    tipo_alergia;
    descripcion;
}
exports.UpdateAllergyDto = UpdateAllergyDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El tipo de alergia debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateAllergyDto.prototype, "tipo_alergia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateAllergyDto.prototype, "descripcion", void 0);
// DTOs para condiciones médicas
class CreateConditionDto {
    id_paciente;
    discapacidad;
    embarazada;
    cicatrices_descripcion;
    tatuajes_descripcion;
}
exports.CreateConditionDto = CreateConditionDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del paciente es requerido' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateConditionDto.prototype, "id_paciente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La discapacidad debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateConditionDto.prototype, "discapacidad", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El estado de embarazo debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateConditionDto.prototype, "embarazada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción de cicatrices debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateConditionDto.prototype, "cicatrices_descripcion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción de tatuajes debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateConditionDto.prototype, "tatuajes_descripcion", void 0);
class UpdateConditionDto {
    discapacidad;
    embarazada;
    cicatrices_descripcion;
    tatuajes_descripcion;
}
exports.UpdateConditionDto = UpdateConditionDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La discapacidad debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateConditionDto.prototype, "discapacidad", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El estado de embarazo debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateConditionDto.prototype, "embarazada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción de cicatrices debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateConditionDto.prototype, "cicatrices_descripcion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción de tatuajes debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateConditionDto.prototype, "tatuajes_descripcion", void 0);
// DTOs para antecedentes médicos
class CreateBackgroundDto {
    id_paciente;
    tipo_antecedente;
    descripcion_antecedente;
    fecha_antecedente;
}
exports.CreateBackgroundDto = CreateBackgroundDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del paciente es requerido' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateBackgroundDto.prototype, "id_paciente", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El tipo de antecedente es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El tipo de antecedente debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateBackgroundDto.prototype, "tipo_antecedente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción del antecedente debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateBackgroundDto.prototype, "descripcion_antecedente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)({}, { message: 'La fecha del antecedente debe tener un formato válido (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], CreateBackgroundDto.prototype, "fecha_antecedente", void 0);
class UpdateBackgroundDto {
    tipo_antecedente;
    descripcion_antecedente;
    fecha_antecedente;
}
exports.UpdateBackgroundDto = UpdateBackgroundDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El tipo de antecedente debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateBackgroundDto.prototype, "tipo_antecedente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción del antecedente debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateBackgroundDto.prototype, "descripcion_antecedente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)({}, { message: 'La fecha del antecedente debe tener un formato válido (YYYY-MM-DD)' }),
    __metadata("design:type", String)
], UpdateBackgroundDto.prototype, "fecha_antecedente", void 0);
// DTOs para antecedentes familiares
class CreateFamilyBackgroundDto {
    id_paciente;
    tipo_antecedente;
    parentesco;
    descripcion_antecedente;
}
exports.CreateFamilyBackgroundDto = CreateFamilyBackgroundDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del paciente es requerido' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateFamilyBackgroundDto.prototype, "id_paciente", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El tipo de antecedente es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El tipo de antecedente debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateFamilyBackgroundDto.prototype, "tipo_antecedente", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El parentesco es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El parentesco debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateFamilyBackgroundDto.prototype, "parentesco", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción del antecedente debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateFamilyBackgroundDto.prototype, "descripcion_antecedente", void 0);
class UpdateFamilyBackgroundDto {
    tipo_antecedente;
    parentesco;
    descripcion_antecedente;
}
exports.UpdateFamilyBackgroundDto = UpdateFamilyBackgroundDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El tipo de antecedente debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateFamilyBackgroundDto.prototype, "tipo_antecedente", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El parentesco debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateFamilyBackgroundDto.prototype, "parentesco", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción del antecedente debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateFamilyBackgroundDto.prototype, "descripcion_antecedente", void 0);
// DTOs para vacunas
class CreateVaccineDto {
    id_paciente;
    vacuna;
}
exports.CreateVaccineDto = CreateVaccineDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del paciente es requerido' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateVaccineDto.prototype, "id_paciente", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre de la vacuna es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El nombre de la vacuna debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateVaccineDto.prototype, "vacuna", void 0);
class UpdateVaccineDto {
    vacuna;
}
exports.UpdateVaccineDto = UpdateVaccineDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El nombre de la vacuna debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateVaccineDto.prototype, "vacuna", void 0);
class CreateDiseaseDto {
    id_paciente;
    enfermedad;
}
exports.CreateDiseaseDto = CreateDiseaseDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del paciente es requerido' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del paciente debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateDiseaseDto.prototype, "id_paciente", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre de la enfermedad es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El nombre de la enfermedad debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateDiseaseDto.prototype, "enfermedad", void 0);
class UpdateDiseaseDto {
    enfermedad;
}
exports.UpdateDiseaseDto = UpdateDiseaseDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El nombre de la enfermedad debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateDiseaseDto.prototype, "enfermedad", void 0);
