"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchMedicalInfoController = void 0;
const batch_medical_info_service_1 = require("./batch-medical-info.service");
class BatchMedicalInfoController {
    batchMedicalInfoService;
    constructor() {
        this.batchMedicalInfoService = new batch_medical_info_service_1.BatchMedicalInfoService();
    }
    /**
     * Crea múltiples vacunas para un paciente
     * @route POST /api/medical-info/batch/vaccines
     */
    createBatchVaccines = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const data = req.body;
            const vaccines = await this.batchMedicalInfoService.createBatchVaccines(data, userId);
            const response = {
                success: true,
                message: `${vaccines.length} vacunas creadas correctamente`,
                data: vaccines,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Crea múltiples alergias para un paciente
     * @route POST /api/medical-info/batch/allergies
     */
    createBatchAllergies = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const data = req.body;
            const allergies = await this.batchMedicalInfoService.createBatchAllergies(data, userId);
            const response = {
                success: true,
                message: `${allergies.length} alergias creadas correctamente`,
                data: allergies,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Crea múltiples antecedentes para un paciente
     * @route POST /api/medical-info/batch/backgrounds
     */
    createBatchBackgrounds = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const data = req.body;
            const backgrounds = await this.batchMedicalInfoService.createBatchBackgrounds(data, userId);
            const response = {
                success: true,
                message: `${backgrounds.length} antecedentes creados correctamente`,
                data: backgrounds,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Crea múltiples antecedentes familiares para un paciente
     * @route POST /api/medical-info/batch/family-backgrounds
     */
    createBatchFamilyBackgrounds = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const data = req.body;
            const familyBackgrounds = await this.batchMedicalInfoService.createBatchFamilyBackgrounds(data, userId);
            const response = {
                success: true,
                message: `${familyBackgrounds.length} antecedentes familiares creados correctamente`,
                data: familyBackgrounds,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
   * Crea múltiples enfermedades para un paciente
   * @route POST /api/medical-info/batch/diseases
   */
    createBatchDiseases = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const data = req.body;
            const diseases = await this.batchMedicalInfoService.createBatchDiseases(data, userId);
            const response = {
                success: true,
                message: `${diseases.length} enfermedades creadas correctamente`,
                data: diseases,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.BatchMedicalInfoController = BatchMedicalInfoController;
