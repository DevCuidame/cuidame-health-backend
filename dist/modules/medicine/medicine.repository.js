"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicineRepository = void 0;
const control_medicine_model_1 = require("@models/control-medicine.model");
const error_handler_1 = require("@utils/error-handler");
const database_1 = require("src/core/config/database");
const typeorm_1 = require("typeorm");
/**
 * Repositorio para gestionar los medicamentos y sus archivos asociados
 */
class MedicineRepository {
    medicineRepository;
    fileMedicineRepository;
    medicineHistoryRepository;
    constructor() {
        this.medicineRepository = database_1.AppDataSource.getRepository(control_medicine_model_1.ControlMedicine);
        this.fileMedicineRepository = database_1.AppDataSource.getRepository(control_medicine_model_1.FileMedicine);
        this.medicineHistoryRepository = database_1.AppDataSource.getRepository(control_medicine_model_1.MedicineChangesHistory);
    }
    // Métodos para control de medicamentos
    async createMedicine(data) {
        const medicine = this.medicineRepository.create(data);
        return await this.medicineRepository.save(medicine);
    }
    async getMedicineById(id) {
        return await this.medicineRepository.findOne({
            where: { id },
            relations: ['patient', 'files']
        });
    }
    async getMedicinesByPatient(patientId, filters) {
        const query = {
            id_patient: patientId,
            ...filters
        };
        return await this.medicineRepository.find({
            where: query,
            relations: ['files'],
            order: { date_order: 'DESC' }
        });
    }
    async updateMedicine(id, data) {
        const medicine = await this.getMedicineById(id);
        if (!medicine) {
            throw new error_handler_1.NotFoundError(`Medicamento con ID ${id} no encontrado`);
        }
        await this.medicineRepository.update(id, data);
        return await this.getMedicineById(id);
    }
    async deleteMedicine(id) {
        const medicine = await this.getMedicineById(id);
        if (!medicine) {
            throw new error_handler_1.NotFoundError(`Medicamento con ID ${id} no encontrado`);
        }
        const result = await this.medicineRepository.delete(id);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
    // Métodos para archivos de medicamentos
    async createFileMedicine(data) {
        const file = this.fileMedicineRepository.create(data);
        return await this.fileMedicineRepository.save(file);
    }
    async getFileMedicineById(id) {
        return await this.fileMedicineRepository.findOne({
            where: { id },
            relations: ['order']
        });
    }
    async getFilesByMedicineId(medicineId) {
        return await this.fileMedicineRepository.find({
            where: { id_order: medicineId },
            order: { created_at: 'DESC' }
        });
    }
    async updateFileMedicine(id, data) {
        const file = await this.getFileMedicineById(id);
        if (!file) {
            throw new error_handler_1.NotFoundError(`Archivo de medicamento con ID ${id} no encontrado`);
        }
        await this.fileMedicineRepository.update(id, data);
        return await this.getFileMedicineById(id);
    }
    async deleteFileMedicine(id) {
        const file = await this.getFileMedicineById(id);
        if (!file) {
            throw new error_handler_1.NotFoundError(`Archivo de medicamento con ID ${id} no encontrado`);
        }
        const result = await this.fileMedicineRepository.delete(id);
        return result.affected !== undefined && result.affected !== null && result.affected > 0;
    }
    // Métodos para historial de cambios
    async getMedicineHistory(medicineId) {
        return await this.medicineHistoryRepository.find({
            where: {
                table_name: 'controlMedicines',
                record_id: medicineId
            },
            order: { changed_at: 'DESC' }
        });
    }
    // Métodos para filtrar medicamentos
    async getMedicinesByStatus(patientId, status) {
        return await this.medicineRepository.find({
            where: {
                id_patient: patientId,
                delivery_status: status
            },
            relations: ['files'],
            order: { date_order: 'DESC' }
        });
    }
    async getPendingMedicines(patientId) {
        return await this.medicineRepository.find({
            where: [
                {
                    id_patient: patientId,
                    delivery_status: 'pendiente'
                },
                {
                    id_patient: patientId,
                    delivery_status: 'en_proceso'
                }
            ],
            relations: ['files'],
            order: { date_order: 'DESC' }
        });
    }
    async getAuthorizedMedicines(patientId) {
        return await this.medicineRepository.find({
            where: {
                id_patient: patientId,
                authorized: true
            },
            relations: ['files'],
            order: { date_order: 'DESC' }
        });
    }
    async getUnauthorizedMedicines(patientId) {
        return await this.medicineRepository.find({
            where: {
                id_patient: patientId,
                authorized: false
            },
            relations: ['files'],
            order: { date_order: 'DESC' }
        });
    }
    async getMedicinesByDateRange(patientId, startDate, endDate) {
        return await this.medicineRepository.find({
            where: {
                id_patient: patientId,
                date_order: (0, typeorm_1.Between)(startDate, endDate)
            },
            relations: ['files'],
            order: { date_order: 'DESC' }
        });
    }
}
exports.MedicineRepository = MedicineRepository;
