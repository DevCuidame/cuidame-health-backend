// src/modules/appointment/routes/professional-stats.routes.ts
import { Router } from 'express';
import { ProfessionalStatsController } from '../controllers/professional-stats.controller';
import { authMiddleware, restrictTo } from '../../../middlewares/auth.middleware';

const router = Router();
const professionalStatsController = new ProfessionalStatsController();

// Todas las rutas son protegidas y requieren rol de administrador
router.use(authMiddleware);
router.use(restrictTo('admin'));

/**
 * @route GET /api/admin/professionals/:id/stats
 * @desc Obtener estadísticas detalladas de un profesional
 * @access Private (Admin only)
 */
router.get('/:id/stats', professionalStatsController.getProfessionalStats);

/**
 * @route GET /api/admin/professionals/ranking
 * @desc Obtener ranking de profesionales
 * @access Private (Admin only)
 */
router.get('/ranking', professionalStatsController.getProfessionalsRanking);

/**
 * @route GET /api/admin/professionals/comparative-stats
 * @desc Obtener estadísticas comparativas
 * @access Private (Admin only)
 */
router.get('/comparative-stats', professionalStatsController.getComparativeStats);

export default router;