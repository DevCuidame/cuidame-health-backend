import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, FindOptionsWhere } from 'typeorm';
import { AppDataSource } from '../config/database';
import { ControlMedicine, FileMedicine, MedicineChangesHistory } from '../models/control-medicine.model';
import { NotFoundError } from '../utils/error-handler';

/**
 * Repositorio para gestionar los medicamentos y sus archivos asociados
 */
export class MedicineRepository {
  private medicineRepository: Repository<ControlMedicine>;
  private fileMedicineRepository: Repository<FileMedicine>;
  private medicineHistoryRepository: Repository<MedicineChangesHistory>;

  constructor() {
    this.medicineRepository = AppDataSource.getRepository(ControlMedicine);
    this.fileMedicineRepository = AppDataSource.getRepository(FileMedicine);
    this.medicineHistoryRepository = AppDataSource.getRepository(MedicineChangesHistory);
  }

  // Métodos para control de medicamentos
  async createMedicine(data: Partial<ControlMedicine>): Promise<ControlMedicine> {
    const medicine = this.medicineRepository.create(data);
    return await this.medicineRepository.save(medicine);
  }

  async getMedicineById(id: number): Promise<ControlMedicine | null> {
    return await this.medicineRepository.findOne({
      where: { id },
      relations: ['patient', 'files']
    });
  }

  async getMedicinesByPatient(patientId: number, filters?: FindOptionsWhere<ControlMedicine>): Promise<ControlMedicine[]> {
    const query: FindOptionsWhere<ControlMedicine> = { 
      id_patient: patientId,
      ...filters
    };
    
    return await this.medicineRepository.find({
      where: query,
      relations: ['files'],
      order: { date_order: 'DESC' }
    });
  }

  async updateMedicine(id: number, data: Partial<ControlMedicine>): Promise<ControlMedicine> {
    const medicine = await this.getMedicineById(id);
    if (!medicine) {
      throw new NotFoundError(`Medicamento con ID ${id} no encontrado`);
    }
    
    await this.medicineRepository.update(id, data);
    return await this.getMedicineById(id) as ControlMedicine;
  }

  async deleteMedicine(id: number): Promise<boolean> {
    const medicine = await this.getMedicineById(id);
    if (!medicine) {
      throw new NotFoundError(`Medicamento con ID ${id} no encontrado`);
    }
    
    const result = await this.medicineRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }

  // Métodos para archivos de medicamentos
  async createFileMedicine(data: Partial<FileMedicine>): Promise<FileMedicine> {
    const file = this.fileMedicineRepository.create(data);
    return await this.fileMedicineRepository.save(file);
  }

  async getFileMedicineById(id: number): Promise<FileMedicine | null> {
    return await this.fileMedicineRepository.findOne({
      where: { id },
      relations: ['order']
    });
  }

  async getFilesByMedicineId(medicineId: number): Promise<FileMedicine[]> {
    return await this.fileMedicineRepository.find({
      where: { id_order: medicineId },
      order: { created_at: 'DESC' }
    });
  }

  async updateFileMedicine(id: number, data: Partial<FileMedicine>): Promise<FileMedicine> {
    const file = await this.getFileMedicineById(id);
    if (!file) {
      throw new NotFoundError(`Archivo de medicamento con ID ${id} no encontrado`);
    }
    
    await this.fileMedicineRepository.update(id, data);
    return await this.getFileMedicineById(id) as FileMedicine;
  }

  async deleteFileMedicine(id: number): Promise<boolean> {
    const file = await this.getFileMedicineById(id);
    if (!file) {
      throw new NotFoundError(`Archivo de medicamento con ID ${id} no encontrado`);
    }
    
    const result = await this.fileMedicineRepository.delete(id);
    return result.affected !== undefined && result.affected > 0;
  }

  // Métodos para historial de cambios
  async getMedicineHistory(medicineId: number): Promise<MedicineChangesHistory[]> {
    return await this.medicineHistoryRepository.find({
      where: { 
        table_name: 'controlMedicines',
        record_id: medicineId
      },
      order: { changed_at: 'DESC' }
    });
  }

  // Métodos para filtrar medicamentos
  async getMedicinesByStatus(patientId: number, status: string): Promise<ControlMedicine[]> {
    return await this.medicineRepository.find({
      where: { 
        id_patient: patientId,
        delivery_status: status
      },
      relations: ['files'],
      order: { date_order: 'DESC' }
    });
  }

  async getPendingMedicines(patientId: number): Promise<ControlMedicine[]> {
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

  async getAuthorizedMedicines(patientId: number): Promise<ControlMedicine[]> {
    return await this.medicineRepository.find({
      where: { 
        id_patient: patientId,
        authorized: true
      },
      relations: ['files'],
      order: { date_order: 'DESC' }
    });
  }

  async getUnauthorizedMedicines(patientId: number): Promise<ControlMedicine[]> {
    return await this.medicineRepository.find({
      where: { 
        id_patient: patientId,
        authorized: false
      },
      relations: ['files'],
      order: { date_order: 'DESC' }
    });
  }

  async getMedicinesByDateRange(patientId: number, startDate: Date, endDate: Date): Promise<ControlMedicine[]> {
    return await this.medicineRepository.find({
      where: { 
        id_patient: patientId,
        date_order: Between(startDate, endDate)
      },
      relations: ['files'],
      order: { date_order: 'DESC' }
    });
  }
}