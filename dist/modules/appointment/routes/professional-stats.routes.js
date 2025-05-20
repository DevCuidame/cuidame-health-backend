"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/appointment/routes/professional-stats.routes.ts
const express_1 = require("express");
const professional_stats_controller_1 = require("../controllers/professional-stats.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const professionalStatsController = new professional_stats_controller_1.ProfessionalStatsController();
// Todas las rutas son protegidas y requieren rol de administrador
router.use(auth_middleware_1.authMiddleware);
router.use((0, auth_middleware_1.restrictTo)('admin'));
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
exports.default = router;
