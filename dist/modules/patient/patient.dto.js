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
exports.UpdatePatientDto = exports.CreatePatientDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreatePatientDto {
    id;
    nombre;
    apellido;
    code;
    tipoid;
    numeroid;
    telefono;
    fecha_nacimiento;
    city_id;
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
    nit;
    photourl;
    public_name;
    imagebs64;
}
exports.CreatePatientDto = CreatePatientDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El ID debe ser un número' }),
    __metadata("design:type", Number)
], CreatePatientDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El apellido es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El apellido debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "apellido", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El código debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El tipo de identificación es requerido' }),
    (0, class_validator_1.IsString)({
        message: 'El tipo de identificación debe ser una cadena de texto',
    }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "tipoid", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El número de identificación es requerido' }),
    (0, class_validator_1.IsString)({
        message: 'El número de identificación debe ser una cadena de texto',
    }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "numeroid", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El teléfono es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El teléfono debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "telefono", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)({}, {
        message: 'La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)',
    }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "fecha_nacimiento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID de la ciudad debe ser un número' }),
    __metadata("design:type", Number)
], CreatePatientDto.prototype, "city_id", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El género es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El género debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "genero", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La ciudad debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "ciudad", void 0);
__decorate([
    (0, class_validator_1.IsOptional)({ message: 'El departamento es requerido' }),
    (0, class_validator_1.IsString)({ message: 'El departamento debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "departamento", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'La dirección es requerida' }),
    (0, class_validator_1.IsString)({ message: 'La dirección debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "direccion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El grupo sanguíneo (RH) debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "rh", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La EPS debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "eps", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La medicina prepagada debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "prepagada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La ARL debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "arl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El seguro funerario debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "seguro_funerario", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID del cuidador a cargo es requerido' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID del cuidador a cargo debe ser un número' }),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreatePatientDto.prototype, "a_cargo_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La imagen debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "image", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El NIT debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "nit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La URL de la foto debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "photourl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La URL de la foto debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreatePatientDto.prototype, "public_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreatePatientDto.prototype, "imagebs64", void 0);
class UpdatePatientDto {
    id;
    code;
    nombre;
    apellido;
    tipoid;
    numeroid;
    city_id;
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
    image;
    public_name;
    photourl;
    imagebs64;
}
exports.UpdatePatientDto = UpdatePatientDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El id debe ser un número' }),
    __metadata("design:type", Object)
], UpdatePatientDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El código debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El apellido debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "apellido", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({
        message: 'El tipo de identificación debe ser una cadena de texto',
    }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "tipoid", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'El número de identificación es requerido' }),
    (0, class_validator_1.IsString)({
        message: 'El número de identificación debe ser una cadena de texto',
    }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "numeroid", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El ID de la ciudad debe ser un número' }),
    __metadata("design:type", Number)
], UpdatePatientDto.prototype, "city_id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El teléfono debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "telefono", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)({}, {
        message: 'La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)',
    }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "fecha_nacimiento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El género debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "genero", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La ciudad debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "ciudad", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El departamento debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "departamento", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La dirección debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "direccion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El grupo sanguíneo (RH) debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "rh", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La EPS debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "eps", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La medicina prepagada debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "prepagada", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La ARL debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "arl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El seguro funerario debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "seguro_funerario", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La imagen debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "image", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La URL de la foto debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "public_name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La URL de la foto debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "photourl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePatientDto.prototype, "imagebs64", void 0);
