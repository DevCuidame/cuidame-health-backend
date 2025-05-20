"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionController = void 0;
const condition_service_1 = require("./condition.service");
class ConditionController {
    conditionService;
    constructor() {
        this.conditionService = new condition_service_1.ConditionService();
    }
    /**
     * Crea o actualiza la condición de un paciente
     * @route POST /api/medical-info/condition
     */
    saveCondition = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const data = req.body;
            const condition = await this.conditionService.saveCondition(data, userId);
            const response = {
                success: true,
                message: 'Condición guardada correctamente',
                data: condition,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtiene la condición de un paciente
     * @route GET /api/medical-info/condition/:patientId
     */
    getConditionByPatient = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const patientId = parseInt(req.params.patientId);
            const condition = await this.conditionService.getConditionByPatient(patientId, userId);
            const response = {
                success: true,
                data: condition,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ConditionController = ConditionController;
