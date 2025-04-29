// src/modules/appointment/routes/questionnaire.routes.ts
import { Router } from 'express';
import { QuestionnaireController } from '../controllers/questionnaire.controller';
import { authMiddleware, restrictTo } from '../../../middlewares/auth.middleware';

const router = Router();
const questionnaireController = new QuestionnaireController();

/**
 * Rutas que requieren autenticación
 */
router.use(authMiddleware);

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
router.use(restrictTo('admin'));
router.get('/', questionnaireController.getAllQuestionnaires);
router.get('/:id', questionnaireController.getQuestionnaireById);
router.post('/', questionnaireController.createQuestionnaire);
router.put('/:id', questionnaireController.updateQuestionnaire);
router.delete('/:id', questionnaireController.deactivateQuestionnaire);
router.post('/:id/questions', questionnaireController.addQuestion);
router.put('/questions/:id', questionnaireController.updateQuestion);
router.delete('/questions/:id', questionnaireController.deleteQuestion);
router.put('/:id/questions/reorder', questionnaireController.reorderQuestions);

export default router;