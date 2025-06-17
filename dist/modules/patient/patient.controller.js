"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientController = void 0;
const patient_service_1 = require("./patient.service");
const error_handler_1 = require("../../utils/error-handler");
class PatientController {
    patientService;
    constructor() {
        this.patientService = new patient_service_1.PatientService();
    }
    /**
     * Crear un nuevo paciente
     * @route POST /api/patients
     */
    createPatient = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const patientData = req.body;
            const patient = await this.patientService.createPatient(patientData, userId);
            const response = {
                success: true,
                message: 'Paciente creado correctamente',
                data: patient,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener un paciente por ID
     * @route GET /api/patients/:id
     */
    getPatientById = async (req, res, next) => {
        try {
            const patientId = parseInt(req.params.id);
            const userId = req.user?.id;
            const patient = await this.patientService.getPatientById(patientId, userId);
            const response = {
                success: true,
                data: patient,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
   * Obtiene la información completa de un paciente incluyendo datos de salud
   * @route GET /api/patients/:id/health-data
   */
    getPatientWithHealthData = async (req, res, next) => {
        try {
            const id = parseInt(req.params.id, 10);
            const caregiverId = req.user?.id;
            const patient = await this.patientService.getPatientWithHealthData(id, caregiverId);
            const response = {
                success: true,
                message: 'Paciente con datos de salud obtenido correctamente',
                data: patient,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener detalles completos de un paciente
     * @route GET /api/patients/:id/details
     */
    getPatientFullDetails = async (req, res, next) => {
        try {
            const patientId = parseInt(req.params.id);
            const userId = req.user?.id;
            const patientDetails = await this.patientService.getPatientFullDetails(patientId, userId);
            const response = {
                success: true,
                data: patientDetails,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener pacientes del usuario autenticado
     * @route GET /api/patients/my-patients
     */
    getMyPatients = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const patients = await this.patientService.getPatientsByCaregiver(userId);
            const response = {
                success: true,
                data: patients,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener paciente by identification type and number
     * @route GET /api/patients/identification/identificationType/identificationNumber
     */
    getPatientByIdAndNum = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const identificationType = req.params.identificationType;
            const identificationNumber = req.params.identificationNumber;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const patient = await this.patientService.getPatientByIdAndNum(identificationType, identificationNumber);
            const response = {
                success: true,
                data: patient,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Buscar pacientes
     * @route GET /api/patients/search
     */
    searchPatients = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            const search = req.query.q || '';
            const patients = await this.patientService.searchPatients(search, userId);
            const response = {
                success: true,
                data: patients,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener todos los pacientes (con paginación - solo para administradores)
     * @route GET /api/patients
     */
    getAllPatients = async (req, res, next) => {
        try {
            const params = {
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) : 10,
                sort: req.query.sort || 'id',
                order: req.query.order || 'ASC'
            };
            const result = await this.patientService.getPatientsWithPagination(params);
            const response = {
                success: true,
                data: result.items,
                metadata: {
                    totalItems: result.metadata.totalItems,
                    itemCount: result.metadata.itemCount,
                    totalPages: result.metadata.totalPages,
                    currentPage: result.metadata.currentPage
                },
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Actualizar un paciente
     * @route PUT /api/patients/:id
     */
    updatePatient = async (req, res, next) => {
        try {
            const patientId = parseInt(req.params.id);
            const userId = req.user?.id;
            const patientData = req.body;
            const updatedPatient = await this.patientService.updatePatient(patientId, patientData, userId);
            const response = {
                success: true,
                message: 'Paciente actualizado correctamente',
                data: updatedPatient,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Actualizar imagen de un paciente
     * @route PUT /api/patients/:id/image
     */
    updatePatientImage = async (req, res, next) => {
        try {
            const patientId = parseInt(req.params.id);
            const userId = req.user?.id;
            const { imageData } = req.body;
            if (!imageData) {
                throw new error_handler_1.BadRequestError('No se proporcionó imagen');
            }
            const updatedPatient = await this.patientService.updatePatientImage(patientId, imageData, userId);
            const response = {
                success: true,
                message: 'Imagen de paciente actualizada correctamente',
                data: { imageUrl: updatedPatient.imagebs64 },
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Eliminar un paciente
     * @route DELETE /api/patients/:id
     */
    deletePatient = async (req, res, next) => {
        try {
            const patientId = parseInt(req.params.id);
            const userId = req.user?.id;
            const result = await this.patientService.deletePatient(patientId, userId);
            const response = {
                success: result.success,
                message: result.message,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener un paciente por código
     * @route GET /api/patients/code/:code
     */
    getPatientByCode = async (req, res, next) => {
        try {
            const code = req.params.code;
            const userId = req.user?.id;
            if (!code) {
                throw new error_handler_1.BadRequestError('El código del paciente es requerido');
            }
            const patient = await this.patientService.getPatientByCode(code, userId);
            const response = {
                success: true,
                message: 'Paciente encontrado correctamente',
                data: patient,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Obtener un paciente por código con datos de ubicación
     * @route POST /api/patients/code/:code
     */
    getPatientByCodeWithLocation = async (req, res, next) => {
        try {
            const code = req.params.code;
            const { location } = req.body;
            const userId = req.user?.id;
            if (!code) {
                throw new error_handler_1.BadRequestError('El código del paciente es requerido');
            }
            console.log(req.body);
            // Log de datos de ubicación si están presentes
            if (location) {
                console.log('Datos de ubicación recibidos:', {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    accuracy: location.accuracy,
                    timestamp: location.timestamp,
                    source: location.source
                });
            }
            const patient = await this.patientService.getPatientByCode(code, userId);
            // Enviar notificaciones si hay datos de ubicación
            if (location && patient) {
                await this.patientService.sendQRScanNotifications(patient, location);
            }
            const response = {
                success: true,
                message: 'Paciente encontrado correctamente',
                data: patient,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.PatientController = PatientController;
