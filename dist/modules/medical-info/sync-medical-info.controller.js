"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncMedicalInfoController = void 0;
const sync_medical_info_service_1 = require("./sync-medical-info.service");
class SyncMedicalInfoController {
    syncMedicalInfoService;
    constructor() {
        this.syncMedicalInfoService = new sync_medical_info_service_1.SyncMedicalInfoService();
    }
    /**
     * Sincroniza las vacunas de un paciente
     * @route POST /api/medical-info/sync/vaccines
     */
    syncVaccines = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const data = req.body;
            const result = await this.syncMedicalInfoService.syncVaccines(data, userId);
            const response = {
                success: true,
                message: `Sincronización completa: ${result.created.length} vacunas creadas, ${result.maintained.length} mantenidas, ${result.deleted.length} eliminadas`,
                data: result,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Sincroniza las alergias de un paciente
     * @route POST /api/medical-info/sync/allergies
     */
    syncAllergies = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const data = req.body;
            const result = await this.syncMedicalInfoService.syncAllergies(data, userId);
            const response = {
                success: true,
                message: `Sincronización completa: ${result.created.length} alergias creadas, ${result.maintained.length} mantenidas, ${result.deleted.length} eliminadas`,
                data: result,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Sincroniza los antecedentes médicos de un paciente
     * @route POST /api/medical-info/sync/backgrounds
     */
    syncBackgrounds = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const data = req.body;
            const result = await this.syncMedicalInfoService.syncBackgrounds(data, userId);
            const response = {
                success: true,
                message: `Sincronización completa: ${result.created.length} antecedentes creados, ${result.maintained.length} mantenidos, ${result.deleted.length} eliminados`,
                data: result,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Sincroniza los antecedentes familiares de un paciente
     * @route POST /api/medical-info/sync/family-backgrounds
     */
    syncFamilyBackgrounds = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const data = req.body;
            const result = await this.syncMedicalInfoService.syncFamilyBackgrounds(data, userId);
            const response = {
                success: true,
                message: `Sincronización completa: ${result.created.length} antecedentes familiares creados, ${result.maintained.length} mantenidos, ${result.deleted.length} eliminados`,
                data: result,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    syncDiseases = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const data = req.body;
            const result = await this.syncMedicalInfoService.syncDiseases(data, userId);
            const response = {
                success: true,
                message: `Sincronización completa: ${result.created.length} enfermedades creadas, ${result.maintained.length} mantenidas, ${result.deleted.length} eliminadas`,
                data: result,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.SyncMedicalInfoController = SyncMedicalInfoController;
