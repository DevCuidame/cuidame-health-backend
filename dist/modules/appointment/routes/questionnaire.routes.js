"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/appointment/routes/questionnaire.routes.ts
const express_1 = require("express");
const questionnaire_controller_1 = require("../controllers/questionnaire.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const questionnaireController = new questionnaire_controller_1.QuestionnaireController();
/**
 * Rutas que requieren autenticación
 */
router.use(auth_middleware_1.authMiddleware);
/**
 * Rutas para pacientes
 */
router.get('/appointment/:id', questionnaireController.getQuestionnaireForAppointment);
router.get('/appointment/:id/responses', questionnaireController.getQuestionnaireResponseForAppointment);
router.post('/appointment/:id/responses', questionnaireController.saveQuestionnaireResponse);
router.get('/patient/:id/responses', questionnaireController.getQuestionnaireResponsesByPatient);
/**
 * Rutas para profesionales
 */
router.get('/active', questionnaireController.getActiveQuestionnaires);
router.get('/appointment-type/:id', questionnaireController.getQuestionnairesByAppointmentType);
/**
 * Rutas solo para administradores
 */
router.use((0, auth_middleware_1.restrictTo)('admin'));
router.get('/', questionnaireController.getAllQuestionnaires);
router.get('/:id', questionnaireController.getQuestionnaireById);
router.post('/', questionnaireController.createQuestionnaire);
router.put('/:id', questionnaireController.updateQuestionnaire);
router.delete('/:id', questionnaireController.deactivateQuestionnaire);
router.post('/:id/questions', questionnaireController.addQuestion);
router.put('/questions/:id', questionnaireController.updateQuestion);
router.delete('/questions/:id', questionnaireController.deleteQuestion);
router.put('/:id/questions/reorder', questionnaireController.reorderQuestions);
exports.default = router;
