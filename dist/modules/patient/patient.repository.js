"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientRepository = void 0;
const base_repository_1 = require("../../core/repositories/base.repository");
const patient_model_1 = require("../../models/patient.model");
class PatientRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(patient_model_1.Patient);
    }
    /**
     * Find one patient by options
     * @param options TypeORM find options
     * @returns Patient or null if not found
     */
    async findOneByOptions(options) {
        return await this.repository.findOne(options);
    }
    formatPatientImageUrl(patient) {
        if (patient.photourl &&
            patient.photourl.startsWith('/home/developer/uploads/')) {
            patient.photourl = patient.photourl.replace('/home/developer/uploads/', '/uploads/');
        }
        return patient;
    }
    /**
     * Verifica si ya existe un paciente con el mismo número de identificación
     * @param numeroid Número de identificación a verificar
     * @param id ID del paciente a excluir (para actualizaciones)
     * @returns true si el paciente ya existe, false en caso contrario
     */
    async existsByNumeroid(numeroid, id) {
        const query = this.repository
            .createQueryBuilder('patient')
            .where('patient.numeroid = :numeroid', { numeroid });
        // Si se proporciona un ID, excluir ese paciente (para actualizaciones)
        if (id) {
            query.andWhere('patient.id != :id', { id });
        }
        const count = await query.getCount();
        return count > 0;
    }
    /**
    * Verifica si ya existe un paciente con el mismo número de teléfono
    * @param numeroid Número de telefono a verificar
    * @param id ID del paciente a excluir (para actualizaciones)
    * @returns true si el paciente ya existe, false en caso contrario
    */
    async existsByPhoneNumber(phone, id) {
        const query = this.repository
            .createQueryBuilder('patient')
            .where('patient.telefono = :telefono', { phone });
        // Si se proporciona un ID, excluir ese paciente (para actualizaciones)
        if (id) {
            query.andWhere('patient.id != :id', { id });
        }
        const count = await query.getCount();
        return count > 0;
    }
    /**
     * Encuentra un paciente por número de identificación
     * @param numeroid Número de identificación
     * @returns Paciente encontrado o null
     */
    async findByNumeroid(numeroid) {
        return await this.repository.findOne({
            where: { numeroid },
            relations: ['caregiver'],
        });
    }
    /**
     * Encuentra un paciente por su código
     * @param code Código del paciente
     * @returns Paciente encontrado o null
     */
    async findByCode(code) {
        return await this.repository.findOne({
            where: { code },
            relations: ['caregiver'],
        });
    }
    /**
     * Encuentra pacientes por ID del cuidador
     * @param caregiverId ID del cuidador
     * @returns Lista de pacientes a cargo del cuidador
     */
    async findByCaregiverId(caregiverId) {
        const patients = await this.repository.find({
            where: { a_cargo_id: caregiverId },
            order: {
                apellido: 'ASC',
                nombre: 'ASC',
            },
        });
        // Formatear las URLs de las imágenes
        return patients.map((patient) => this.formatPatientImageUrl(patient));
    }
    /**
     * Encuentra pacientes por criterios de búsqueda
     * @param search Texto de búsqueda (nombre, apellido, número de ID)
     * @param caregiverId ID del cuidador (opcional)
     * @returns Lista de pacientes que coinciden con los criterios
     */
    async findBySearchCriteria(search, caregiverId) {
        const query = this.repository
            .createQueryBuilder('patient')
            .leftJoinAndSelect('patient.caregiver', 'caregiver');
        // Añadir condición de búsqueda para nombre, apellido o número de ID
        if (search) {
            query.andWhere('(patient.nombre ILIKE :search OR patient.apellido ILIKE :search OR patient.numeroid ILIKE :search)', { search: `%${search}%` });
        }
        // Filtrar por cuidador si se especifica
        if (caregiverId) {
            query.andWhere('patient.a_cargo_id = :caregiverId', { caregiverId });
        }
        // Ordenar resultados
        query
            .orderBy('patient.apellido', 'ASC')
            .addOrderBy('patient.nombre', 'ASC');
        return await query.getMany();
    }
    /**
     * Obtiene detalles completos de un paciente incluyendo todas sus relaciones
     * @param patientId ID del paciente
     * @returns Paciente con todos sus datos relacionados
     */
    async getFullPatientDetails(patientId) {
        const patient = await this.repository.findOne({
            where: { id: patientId },
            relations: [
                'caregiver',
                'allergies',
                'conditions',
                'familyBackgrounds',
                'backgrounds',
                'heartRates',
                'bloodPressures',
                'bloodGlucoses',
                'bloodOxygens',
                'respiratoryRates',
                'vaccines',
                'medicines',
                'medicines.files',
            ],
        });
        return patient;
    }
    /**
     * Genera un código único para un nuevo paciente
     * @returns Código único generado
     */
    async generateUniqueCode() {
        const prefix = 'PAT';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, '0');
        const candidateCode = `${prefix}-${timestamp}-${random}`;
        // Verificar que el código no exista ya
        const existingPatient = await this.findByCode(candidateCode);
        if (existingPatient) {
            // Si existe, intentar de nuevo con un nuevo código
            return this.generateUniqueCode();
        }
        return candidateCode;
    }
    /**
     * Verifica si un paciente pertenece a un cuidador específico
     * @param patientId ID del paciente
     * @param caregiverId ID del cuidador
     * @returns True si el paciente pertenece al cuidador
     */
    async belongsToCaregiver(patientId, caregiverId) {
        const patient = await this.repository.findOne({
            where: {
                id: patientId,
                a_cargo_id: caregiverId,
            },
        });
        return !!patient;
    }
}
exports.PatientRepository = PatientRepository;
