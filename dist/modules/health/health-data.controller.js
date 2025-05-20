"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthDataController = void 0;
const health_data_service_1 = require("./health-data.service");
class HealthDataController {
    healthDataService;
    constructor() {
        this.healthDataService = new health_data_service_1.HealthDataService();
    }
    /**
     * Obtiene todos los datos de salud de un paciente por su ID
     * @route GET /api/health-data/:id
     */
    getHealthDataById = async (req, res, next) => {
        try {
            const patientId = parseInt(req.params.id, 10);
            const caregiverId = req.user?.id;
            const healthData = await this.healthDataService.getHealthDataById(patientId, caregiverId);
            const response = {
                success: true,
                message: 'Datos de salud obtenidos correctamente',
                data: healthData,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.HealthDataController = HealthDataController;
