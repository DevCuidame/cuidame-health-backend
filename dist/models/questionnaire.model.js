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
exports.QuestionResponse = exports.QuestionnaireResponse = exports.QuestionnaireQuestion = exports.Questionnaire = exports.QuestionType = void 0;
// src/models/questionnaire.model.ts
const typeorm_1 = require("typeorm");
const appointment_type_model_1 = require("./appointment-type.model");
var QuestionType;
(function (QuestionType) {
    QuestionType["TEXT"] = "text";
    QuestionType["MULTIPLE_CHOICE"] = "multiple_choice";
    QuestionType["CHECKBOX"] = "checkbox";
    QuestionType["SCALE"] = "scale";
    QuestionType["DATE"] = "date";
    QuestionType["FILE"] = "file";
})(QuestionType || (exports.QuestionType = QuestionType = {}));
let Questionnaire = class Questionnaire {
    id;
    title;
    description;
    is_active;
    appointment_type_id; // Tipo de cita asociado (opcional)
    created_at;
    updated_at;
    // Relaciones
    appointmentType;
    questions;
};
exports.Questionnaire = Questionnaire;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Questionnaire.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Questionnaire.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 1000 }),
    __metadata("design:type", String)
], Questionnaire.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Questionnaire.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Questionnaire.prototype, "appointment_type_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Questionnaire.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Questionnaire.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => appointment_type_model_1.AppointmentType, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'appointment_type_id' }),
    __metadata("design:type", appointment_type_model_1.AppointmentType)
], Questionnaire.prototype, "appointmentType", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => QuestionnaireQuestion, question => question.questionnaire),
    __metadata("design:type", Array)
], Questionnaire.prototype, "questions", void 0);
exports.Questionnaire = Questionnaire = __decorate([
    (0, typeorm_1.Entity)('questionnaires')
], Questionnaire);
let QuestionnaireQuestion = class QuestionnaireQuestion {
    id;
    questionnaire_id;
    question_text;
    help_text;
    question_type;
    options; // Opciones para preguntas de selección
    is_required;
    display_order; // Orden de visualización
    created_at;
    updated_at;
    // Relaciones
    questionnaire;
};
exports.QuestionnaireQuestion = QuestionnaireQuestion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], QuestionnaireQuestion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], QuestionnaireQuestion.prototype, "questionnaire_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], QuestionnaireQuestion.prototype, "question_text", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 1000 }),
    __metadata("design:type", String)
], QuestionnaireQuestion.prototype, "help_text", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: QuestionType,
        default: QuestionType.TEXT
    }),
    __metadata("design:type", String)
], QuestionnaireQuestion.prototype, "question_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], QuestionnaireQuestion.prototype, "options", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], QuestionnaireQuestion.prototype, "is_required", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], QuestionnaireQuestion.prototype, "display_order", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], QuestionnaireQuestion.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], QuestionnaireQuestion.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Questionnaire, questionnaire => questionnaire.questions),
    (0, typeorm_1.JoinColumn)({ name: 'questionnaire_id' }),
    __metadata("design:type", Questionnaire)
], QuestionnaireQuestion.prototype, "questionnaire", void 0);
exports.QuestionnaireQuestion = QuestionnaireQuestion = __decorate([
    (0, typeorm_1.Entity)('questionnaire_questions')
], QuestionnaireQuestion);
let QuestionnaireResponse = class QuestionnaireResponse {
    id;
    questionnaire_id;
    appointment_id;
    patient_id;
    completed_at;
    created_at;
    updated_at;
    // Relaciones
    questionnaire;
    responses;
};
exports.QuestionnaireResponse = QuestionnaireResponse;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], QuestionnaireResponse.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], QuestionnaireResponse.prototype, "questionnaire_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], QuestionnaireResponse.prototype, "appointment_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], QuestionnaireResponse.prototype, "patient_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], QuestionnaireResponse.prototype, "completed_at", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], QuestionnaireResponse.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], QuestionnaireResponse.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Questionnaire),
    (0, typeorm_1.JoinColumn)({ name: 'questionnaire_id' }),
    __metadata("design:type", Questionnaire)
], QuestionnaireResponse.prototype, "questionnaire", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => QuestionResponse, response => response.questionnaire_response),
    __metadata("design:type", Array)
], QuestionnaireResponse.prototype, "responses", void 0);
exports.QuestionnaireResponse = QuestionnaireResponse = __decorate([
    (0, typeorm_1.Entity)('questionnaire_responses')
], QuestionnaireResponse);
let QuestionResponse = class QuestionResponse {
    id;
    questionnaire_response_id;
    question_id;
    response_text;
    response_data; // Para respuestas complejas
    created_at;
    updated_at;
    // Relaciones
    questionnaire_response;
    question;
};
exports.QuestionResponse = QuestionResponse;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], QuestionResponse.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], QuestionResponse.prototype, "questionnaire_response_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], QuestionResponse.prototype, "question_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], QuestionResponse.prototype, "response_text", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], QuestionResponse.prototype, "response_data", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], QuestionResponse.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], QuestionResponse.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => QuestionnaireResponse, qr => qr.responses),
    (0, typeorm_1.JoinColumn)({ name: 'questionnaire_response_id' }),
    __metadata("design:type", QuestionnaireResponse)
], QuestionResponse.prototype, "questionnaire_response", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => QuestionnaireQuestion),
    (0, typeorm_1.JoinColumn)({ name: 'question_id' }),
    __metadata("design:type", QuestionnaireQuestion)
], QuestionResponse.prototype, "question", void 0);
exports.QuestionResponse = QuestionResponse = __decorate([
    (0, typeorm_1.Entity)('question_responses')
], QuestionResponse);
