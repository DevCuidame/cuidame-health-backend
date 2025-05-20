"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfessionalStatsController = void 0;
const professional_stats_service_1 = require("../services/professional-stats.service");
const error_handler_1 = require("../../../utils/error-handler");
class ProfessionalStatsController {
    professionalStatsService;
    constructor() {
        this.professionalStatsService = new professional_stats_service_1.ProfessionalStatsService();
    }
    /**
     * Obtener estadísticas detalladas de un profesional
     * @route GET /api/admin/professionals/:id/stats
     */
    getProfessionalStats = async (req, res, next) => {
        try {
            const professionalId = parseInt(req.params.id);
            if (isNaN(professionalId)) {
                throw new error_handler_1.BadRequestError('ID de profesional inválido');
            }
            // Procesamiento de fechas
            let startDate = new Date();
            let endDate = new Date();
            // Por defecto, último mes
            startDate.setMonth(startDate.getMonth() - 1);
            if (req.query.startDate) {
                startDate = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                endDate = new Date(req.query.endDate);
            }
            const stats = await this.professionalStatsService.getProfessionalStats(professionalId, startDate, endDate);
            const response = {
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener ranking de profesionales
     * @route GET /api/admin/professionals/ranking
     */
    getProfessionalsRanking = async (req, res, next) => {
        try {
            // Procesamiento de fechas
            let startDate = new Date();
            let endDate = new Date();
            // Por defecto, último mes
            startDate.setMonth(startDate.getMonth() - 1);
            if (req.query.startDate) {
                startDate = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                endDate = new Date(req.query.endDate);
            }
            // Límite de resultados
            const limit = req.query.limit ? parseInt(req.query.limit) : 10;
            const ranking = await this.professionalStatsService.getProfessionalsRanking(startDate, endDate, limit);
            const response = {
                success: true,
                data: ranking,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener estadísticas comparativas
     * @route GET /api/admin/professionals/comparative-stats
     */
    getComparativeStats = async (req, res, next) => {
        try {
            // Procesamiento de fechas
            let startDate = new Date();
            let endDate = new Date();
            // Por defecto, último mes
            startDate.setMonth(startDate.getMonth() - 1);
            if (req.query.startDate) {
                startDate = new Date(req.query.startDate);
            }
            if (req.query.endDate) {
                endDate = new Date(req.query.endDate);
            }
            const stats = await this.professionalStatsService.getComparativeStats(startDate, endDate);
            const response = {
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ProfessionalStatsController = ProfessionalStatsController;
