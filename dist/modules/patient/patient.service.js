"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientService = void 0;
const medical_info_repository_1 = require("../../modules/medical-info/medical-info.repository");
const patient_repository_1 = require("./patient.repository");
const health_repository_1 = require("../../modules/health/health.repository");
const file_upload_util_1 = require("../../utils/file-upload.util");
const error_handler_1 = require("../../utils/error-handler");
const code_repository_1 = require("../code/code.repository");
const database_1 = require("../../core/config/database");
const health_data_service_1 = require("../health/health-data.service");
class PatientService {
    patientRepository;
    medicalInfoRepository;
    healthRepository;
    codeRepository;
    constructor() {
        this.patientRepository = new patient_repository_1.PatientRepository();
        this.medicalInfoRepository = new medical_info_repository_1.MedicalInfoRepository();
        this.healthRepository = new health_repository_1.HealthRepository();
        this.codeRepository = new code_repository_1.CodeRepository();
    }
    /**
     * Crear un nuevo paciente
     * @param patientData Datos del paciente
     * @param caregiverId ID del cuidador que crea el paciente
     * @returns familiar creado
     */
    async createPatient(patientData, caregiverId) {
        try {
            // Verificar si ya existe un familiar con el mismo número de identificación
            const patientExists = await this.patientRepository.existsByNumeroid(patientData.numeroid);
            if (patientExists) {
                throw new error_handler_1.BadRequestError(`Ya existe un familiar con el número de identificación`);
            }
            // Obtener un código disponible desde la tabla codes
            if (!patientData.code) {
                const hashcode = await this.codeRepository.getAvailableCodeForPatient();
                patientData.code = hashcode;
            }
            else {
                const code = await this.codeRepository.findByCode(patientData.code);
                patientData.code = code.hashcode;
            }
            const { id, // Eliminamos cualquier id que venga
            public_name, // Eliminamos esta propiedad que no está en la entidad
            departamento: departamentoParam, ...cleanedData } = patientData;
            // Convertimos departamento a string si viene como número
            const departamento = typeof departamentoParam === 'number'
                ? departamentoParam.toString()
                : departamentoParam;
            // Extraer imagen base64 si existe
            const imageBase64 = patientData.imagebs64;
            const patient = await this.patientRepository.create({
                ...cleanedData,
                departamento,
                a_cargo_id: caregiverId,
                photourl: '',
                created_at: new Date(),
                updated_at: new Date(),
            });
            // Si hay imagen, guardarla y actualizar la URL de la foto
            let photoUrl = '';
            if (imageBase64) {
                try {
                    // Guardar imagen usando el servicio de utilidad
                    photoUrl = await file_upload_util_1.FileUploadService.saveBase64Image(imageBase64, 'patients', // Carpeta: patients
                    'profile' // Nombre base: profile
                    );
                    if (photoUrl) {
                        // Actualizar la URL en la base de datos
                        await this.patientRepository.update(patient.id, {
                            photourl: photoUrl,
                            updated_at: new Date(),
                        }, 'Paciente');
                        await this.patientRepository.update(patient.id, {
                            imagebs64: null,
                            updated_at: new Date(),
                        }, 'Paciente');
                        // Actualizar el objeto del familiar antes de devolverlo
                        patient.photourl = photoUrl;
                    }
                }
                catch (error) {
                    console.error('Error al guardar imagen de paciente:', error);
                    // No fallamos el proceso completo si hay error en la imagen
                }
            }
            // Obtener nombres reales de ciudad y departamento
            const { cityName, departmentName } = await this.getLocationInfo(patient.city_id);
            // Crear un objeto enriquecido para devolver al cliente
            const enrichedPatient = {
                ...patient,
                ciudad: cityName || patient.ciudad,
                department_name: departmentName || patient.departamento,
            };
            return enrichedPatient;
        }
        catch (error) {
            if (error instanceof error_handler_1.NotFoundError) {
                throw new error_handler_1.BadRequestError('No hay códigos disponibles para asignar al paciente. Por favor, contacte al administrador.');
            }
            throw error;
        }
    }
    /**
     * Obtiene la información completa de un paciente incluyendo datos de salud
     * @param id ID del paciente
     * @param caregiverId ID del cuidador (opcional)
     * @returns Información completa del paciente con datos de salud
     */
    async getPatientWithHealthData(id, caregiverId) {
        // Verificar que el paciente existe
        const patient = await this.getPatientById(id, caregiverId);
        // Obtener datos de salud
        const healthDataService = new health_data_service_1.HealthDataService();
        const healthData = await healthDataService.getHealthDataById(id, caregiverId);
        // Combinar la información
        return {
            ...patient,
            health_data: healthData,
        };
    }
    /**
     * Obtener un familiar por ID
     * @param patientId ID del paciente
     * @param caregiverId ID del cuidador (para verificar permisos)
     * @returns familiar encontrado
     */
    async getPatientById(patientId, caregiverId) {
        const patient = await this.patientRepository.findById(patientId);
        if (!patient) {
            throw new error_handler_1.NotFoundError(`Paciente con ID ${patientId} no encontrado`);
        }
        // Si se proporciona el ID del cuidador, verificar que tenga permisos
        if (caregiverId && patient.a_cargo_id !== caregiverId) {
            throw new error_handler_1.ForbiddenError('No tienes permiso para acceder a este paciente');
        }
        return patient;
    }
    /**
     * Obtener detalles completos de un paciente
     * @param patientId ID del paciente
     * @param caregiverId ID del cuidador (para verificar permisos)
     * @returns Todos los datos del familiar y su información médica
     */
    async getPatientFullDetails(patientId, caregiverId) {
        // Verificar permisos
        const patient = await this.getPatientById(patientId, caregiverId);
        // Obtener información médica completa
        const medicalInfo = await this.medicalInfoRepository.getAllMedicalInfo(patientId);
        // Obtener últimos signos vitales
        const latestVitals = await this.healthRepository.getLatestVitals(patientId);
        return {
            ...patient,
            medicalInfo,
            vitals: latestVitals,
        };
    }
    /**
     * Obtener pacientes por cuidador
     * @param caregiverId ID del cuidador
     * @returns Lista de pacientes a cargo del cuidador
     */
    async getPatientsByCaregiver(caregiverId) {
        // Obtener pacientes a cargo del usuario
        let patients = await this.patientRepository.findByCaregiverId(caregiverId);
        // Añadir datos de salud y localización para cada paciente a cargo
        if (patients && patients.length > 0) {
            const enrichedPatients = await Promise.all(patients.map(async (patient) => {
                // Remove imagebs64 from patient object to reduce size
                const { ...patientWithoutImage } = patient;
                // Obtener datos de salud para el paciente
                const [latestVitals, medicalInfo] = await Promise.all([
                    this.healthRepository.getLatestVitals(patient.id),
                    this.medicalInfoRepository.getAllMedicalInfo(patient.id)
                ]);
                // Obtener información detallada de ciudad y departamento
                let cityName = patient.ciudad || "";
                let departmentName = patient.departamento || "";
                // Si hay city_id, intentar obtener el nombre real de la ciudad y departamento
                if (patient.city_id) {
                    try {
                        // Obtener datos de la ciudad desde el repositorio de ubicaciones
                        const locationRepository = database_1.AppDataSource.getRepository('townships');
                        const cityData = await locationRepository.findOne({
                            where: { id: patient.city_id },
                            relations: ['department']
                        });
                        if (cityData) {
                            cityName = cityData.name;
                            if (cityData.department) {
                                departmentName = cityData.department.name;
                            }
                        }
                    }
                    catch (error) {
                        console.error('Error al obtener información de localización:', error);
                        // Mantener los valores originales en caso de error
                    }
                }
                // Crear un objeto que combine el paciente con sus datos de salud y localización
                return {
                    ...patientWithoutImage,
                    ciudad: cityName,
                    department_name: departmentName,
                    health_data: {
                        vitals: latestVitals,
                        medical_info: medicalInfo
                    }
                };
            }));
            // Reemplazar la lista original con la enriquecida
            patients = enrichedPatients;
        }
        return patients;
    }
    /**
     * Buscar pacientes por criterios
     * @param search Texto de búsqueda
     * @param caregiverId ID del cuidador (opcional)
     * @returns Lista de pacientes que coinciden con los criterios
     */
    async searchPatients(search, caregiverId) {
        return await this.patientRepository.findBySearchCriteria(search, caregiverId);
    }
    /**
     * Obtener pacientes con paginación
     * @param params Parámetros de paginación
     * @returns Resultado paginado de pacientes
     */
    async getPatientsWithPagination(params) {
        return await this.patientRepository.findWithPagination(params, {
            relations: ['caregiver'],
        });
    }
    /**
     * Actualizar datos de un paciente
     * @param patientId ID del paciente
     * @param patientData Datos a actualizar
     * @param caregiverId ID del cuidador (para verificar permisos)
     * @returns familiar actualizado
     */
    async updatePatient(patientId, patientData, caregiverId) {
        // Verificar permisos
        const patient = await this.getPatientById(patientId, caregiverId);
        // Si se está actualizando el número de identificación, verificar que no exista otro familiar con ese número
        if (patientData.numeroid) {
            const patientExists = await this.patientRepository.existsByNumeroid(patientData.numeroid, patientId);
            if (patientExists) {
                throw new error_handler_1.BadRequestError(`Ya existe un familiar con el número de identificación ${patientData.numeroid}`);
            }
        }
        // Extraer datos de imagen si existe
        const { imagebs64, ...dataToUpdate } = patientData;
        // Preparar objeto con datos a actualizar
        const updateData = {
            ...dataToUpdate,
            updated_at: new Date(),
        };
        // Si se proporciona una nueva imagen, procesarla
        if (imagebs64) {
            // Verificar si existe una imagen previa y eliminarla
            if (patient.photourl) {
                await file_upload_util_1.FileUploadService.deleteFile(patient.photourl);
            }
            // Guardar nueva imagen
            try {
                const photoUrl = await file_upload_util_1.FileUploadService.saveBase64Image(imagebs64, 'patients', 'profile');
                // Añadir URL de la foto al objeto de actualización
                updateData.photourl = photoUrl;
            }
            catch (error) {
                console.error('Error al guardar imagen de paciente:', error);
                // No fallamos el proceso completo si hay error en la imagen
            }
        }
        // Actualizar paciente
        const updatedPatient = await this.patientRepository.update(patientId, updateData, 'Paciente');
        // Obtener nombres reales de ciudad y departamento
        const cityId = updateData.city_id || updatedPatient.city_id;
        const { cityName, departmentName } = await this.getLocationInfo(cityId);
        // Crear un objeto enriquecido para devolver al cliente
        const enrichedPatient = {
            ...updatedPatient,
            ciudad: cityName || updatedPatient.ciudad,
            department_name: departmentName || updatedPatient.departamento,
        };
        return enrichedPatient;
    }
    /**
     * Actualizar imagen de perfil de un paciente
     * @param patientId ID del paciente
     * @param imageData Datos de la imagen (base64)
     * @param caregiverId ID del cuidador (para verificar permisos)
     * @returns familiar actualizado
     */
    async updatePatientImage(patientId, imageData, caregiverId) {
        // Verificar permisos
        const patient = await this.getPatientById(patientId, caregiverId);
        // Verificar si existe una imagen previa y eliminarla
        if (patient.photourl) {
            await file_upload_util_1.FileUploadService.deleteFile(patient.photourl);
        }
        // Guardar nueva imagen
        let photoUrl = '';
        if (imageData) {
            photoUrl = await file_upload_util_1.FileUploadService.saveBase64Image(imageData, 'patients', `patient_${patientId}`, 'profile');
        }
        // Actualizar imagen en la base de datos
        const updatedPatient = await this.patientRepository.update(patientId, {
            imagebs64: imageData,
            photourl: photoUrl,
            updated_at: new Date(),
        }, 'Paciente');
        return updatedPatient;
    }
    /**
     * Eliminar un paciente
     * @param patientId ID del paciente
     * @param caregiverId ID del cuidador (para verificar permisos)
     * @returns Confirmación de eliminación
     */
    async deletePatient(patientId, caregiverId) {
        // Verificar permisos
        const patient = await this.getPatientById(patientId, caregiverId);
        // Si el familiar tiene un hashcode, liberarlo para su reutilización
        if (patient.code) {
            await this.codeRepository.releaseCode(patient.code);
        }
        // Eliminar paciente
        const result = await this.patientRepository.delete(patientId, 'Paciente');
        if (!result) {
            throw new error_handler_1.BadRequestError('No se pudo eliminar el paciente');
        }
        return {
            success: true,
            message: 'Paciente eliminado correctamente',
        };
    }
    /**
     * Verificar si un familiar pertenece a un cuidador
     * @param patientId ID del paciente
     * @param caregiverId ID del cuidador
     * @returns True si el familiar pertenece al cuidador
     */
    async verifyPatientBelongsToCaregiver(patientId, caregiverId) {
        return await this.patientRepository.belongsToCaregiver(patientId, caregiverId);
    }
    /**
     * Obtener información de localización (ciudad y departamento) basado en el city_id
     * @param cityId ID de la ciudad
     * @returns Objeto con los nombres de ciudad y departamento
     */
    async getLocationInfo(cityId) {
        let cityName = '';
        let departmentName = '';
        // Si hay city_id, intentar obtener el nombre real de la ciudad y departamento
        if (cityId) {
            try {
                // Obtener datos de la ciudad desde el repositorio de ubicaciones
                const locationRepository = database_1.AppDataSource.getRepository('townships');
                const cityData = await locationRepository.findOne({
                    where: { id: cityId },
                    relations: ['department'],
                });
                if (cityData) {
                    cityName = cityData.name;
                    if (cityData.department) {
                        departmentName = cityData.department.name;
                    }
                }
            }
            catch (error) {
                console.error('Error al obtener información de localización:', error);
                // Devolver valores por defecto en caso de error
            }
        }
        return { cityName, departmentName };
    }
}
exports.PatientService = PatientService;
