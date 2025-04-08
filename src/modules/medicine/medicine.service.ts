import * as fs from 'fs';
import * as path from 'path';
import { MedicineRepository } from './medicine.repository';
import { PatientRepository } from '@modules/patient/patient.repository';
import { BadRequestError, ForbiddenError, NotFoundError } from '@utils/error-handler';
import { CreateFileMedicineDto, CreateMedicineDto, UpdateMedicineDto } from './medicine.dto';
import { ControlMedicine, FileMedicine, MedicineChangesHistory } from '@models/control-medicine.model';
import config from 'src/core/config/environment';

export class MedicineService {
  private medicineRepository: MedicineRepository;
  private patientRepository: PatientRepository;

  constructor() {
    this.medicineRepository = new MedicineRepository();
    this.patientRepository = new PatientRepository();
  }

  /**
   * Verificar permisos para acceder a los datos de un paciente
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (si aplica)
   */
  private async verifyAccess(patientId: number, caregiverId?: number): Promise<void> {
    // Si no se proporciona ID de cuidador, no verificar permisos
    if (!caregiverId) return;
    
    const hasAccess = await this.patientRepository.belongsToCaregiver(patientId, caregiverId);
    if (!hasAccess) {
      throw new ForbiddenError('No tienes permiso para acceder a los datos de este paciente');
    }
  }

  /**
   * Crear un nuevo registro de medicamento
   * @param data Datos del medicamento
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Medicamento creado
   */
  async createMedicine(data: CreateMedicineDto, caregiverId?: number): Promise<ControlMedicine> {
    await this.verifyAccess(data.id_patient, caregiverId);
    
    return await this.medicineRepository.createMedicine({
      ...data,
      date_order: new Date(data.date_order),
      date_auth: data.date_auth ? new Date(data.date_auth) : undefined,
      delivery_date: data.delivery_date ? new Date(data.delivery_date) : undefined
    });
  }

  /**
   * Obtener un medicamento por ID
   * @param id ID del medicamento
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Medicamento encontrado
   */
  async getMedicineById(id: number, caregiverId?: number): Promise<ControlMedicine> {
    const medicine = await this.medicineRepository.getMedicineById(id);
    
    if (!medicine) {
      throw new NotFoundError(`Medicamento con ID ${id} no encontrado`);
    }
    
    await this.verifyAccess(medicine.id_patient, caregiverId);
    
    return medicine;
  }

  /**
   * Obtener medicamentos por paciente
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Lista de medicamentos del paciente
   */
  async getMedicinesByPatient(patientId: number, caregiverId?: number): Promise<ControlMedicine[]> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.medicineRepository.getMedicinesByPatient(patientId);
  }

  /**
   * Actualizar un medicamento
   * @param id ID del medicamento
   * @param data Datos a actualizar
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Medicamento actualizado
   */
  async updateMedicine(id: number, data: UpdateMedicineDto, caregiverId?: number): Promise<ControlMedicine> {
    const medicine = await this.getMedicineById(id, caregiverId);
    
    const updateData: any = { ...data };
    
    // Convertir fechas si existen
    if (data.date_order) {
      updateData.date_order = new Date(data.date_order);
    }
    
    if (data.date_auth) {
      updateData.date_auth = new Date(data.date_auth);
    }
    
    if (data.delivery_date) {
      updateData.delivery_date = new Date(data.delivery_date);
    }
    
    return await this.medicineRepository.updateMedicine(id, updateData);
  }

  /**
   * Eliminar un medicamento
   * @param id ID del medicamento
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Resultado de la eliminación
   */
  async deleteMedicine(id: number, caregiverId?: number): Promise<{ success: boolean; message: string }> {
    const medicine = await this.getMedicineById(id, caregiverId);
    
    // Eliminar archivos asociados
    const files = await this.medicineRepository.getFilesByMedicineId(id);
    for (const file of files) {
      try {
        // Eliminar archivo físico si existe
        if (file.path) {
          const filePath = path.join(process.cwd(), file.path);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      } catch (error) {
        console.error(`Error eliminando archivo ${file.id}:`, error);
      }
    }
    
    const result = await this.medicineRepository.deleteMedicine(id);
    
    return {
      success: result,
      message: result ? 'Medicamento eliminado correctamente' : 'No se pudo eliminar el medicamento'
    };
  }

  /**
   * Crear un archivo de medicamento
   * @param data Datos del archivo
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Archivo creado
   */
  async createFileMedicine(data: CreateFileMedicineDto, file?: Express.Multer.File, caregiverId?: number): Promise<FileMedicine> {
    // Verificar que el medicamento existe y que el usuario tiene permisos
    const medicine = await this.getMedicineById(data.id_order, caregiverId);
    
    let filePath = data.path;
    let base64Data = data.base64;
    
    // Si se proporciona un archivo, guardarlo en el sistema de archivos
    if (file) {
      const uploadDir = path.join(process.cwd(), config.fileUpload.path, 'medicines');
      
      // Crear directorio si no existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Generar nombre de archivo único
      const fileName = `${Date.now()}-${file.originalname}`;
      filePath = path.join('medicines', fileName);
      
      // Guardar archivo
      fs.writeFileSync(path.join(uploadDir, fileName), file.buffer);
    }
    
    // Si se proporciona base64, guardar como archivo
    else if (base64Data) {
      const uploadDir = path.join(process.cwd(), config.fileUpload.path, 'medicines');
      
      // Crear directorio si no existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Extraer datos de base64
      const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        throw new BadRequestError('Formato de base64 inválido');
      }
      
      const type = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      
      // Determinar extensión de archivo según tipo MIME
      let extension = 'jpg';
      if (type.includes('jpeg')) extension = 'jpg';
      else if (type.includes('png')) extension = 'png';
      else if (type.includes('pdf')) extension = 'pdf';
      
      // Generar nombre de archivo único
      const fileName = `${Date.now()}.${extension}`;
      filePath = path.join('medicines', fileName);
      
      // Guardar archivo
      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
    }
    
    return await this.medicineRepository.createFileMedicine({
      name: data.name,
      path: filePath,
      category: data.category,
      id_order: data.id_order,
      base64: base64Data
    });
  }

  /**
   * Obtener un archivo de medicamento por ID
   * @param id ID del archivo
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Archivo encontrado
   */
  async getFileMedicineById(id: number, caregiverId?: number): Promise<FileMedicine> {
    const file = await this.medicineRepository.getFileMedicineById(id);
    
    if (!file) {
      throw new NotFoundError(`Archivo de medicamento con ID ${id} no encontrado`);
    }
    
    // Verificar permisos
    const medicine = await this.getMedicineById(file.id_order, caregiverId);
    
    return file;
  }

  /**
   * Obtener archivos de un medicamento
   * @param medicineId ID del medicamento
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Lista de archivos del medicamento
   */
  async getFilesByMedicineId(medicineId: number, caregiverId?: number): Promise<FileMedicine[]> {
    // Verificar permisos
    const medicine = await this.getMedicineById(medicineId, caregiverId);
    
    return await this.medicineRepository.getFilesByMedicineId(medicineId);
  }

  /**
   * Eliminar un archivo de medicamento
   * @param id ID del archivo
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Resultado de la eliminación
   */
  async deleteFileMedicine(id: number, caregiverId?: number): Promise<{ success: boolean; message: string }> {
    const file = await this.getFileMedicineById(id, caregiverId);
    
    // Eliminar archivo físico si existe
    if (file.path) {
      try {
        const filePath = path.join(process.cwd(), file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Error eliminando archivo físico:`, error);
      }
    }
    
    const result = await this.medicineRepository.deleteFileMedicine(id);
    
    return {
      success: result,
      message: result ? 'Archivo eliminado correctamente' : 'No se pudo eliminar el archivo'
    };
  }

  /**
   * Obtener el historial de cambios de un medicamento
   * @param medicineId ID del medicamento
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Historial de cambios del medicamento
   */
  async getMedicineHistory(medicineId: number, caregiverId?: number): Promise<MedicineChangesHistory[]> {
    // Verificar permisos
    const medicine = await this.getMedicineById(medicineId, caregiverId);
    
    return await this.medicineRepository.getMedicineHistory(medicineId);
  }

  /**
   * Obtener medicamentos pendientes de un paciente
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Lista de medicamentos pendientes
   */
  async getPendingMedicines(patientId: number, caregiverId?: number): Promise<ControlMedicine[]> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.medicineRepository.getPendingMedicines(patientId);
  }

  /**
   * Obtener medicamentos autorizados de un paciente
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Lista de medicamentos autorizados
   */
  async getAuthorizedMedicines(patientId: number, caregiverId?: number): Promise<ControlMedicine[]> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.medicineRepository.getAuthorizedMedicines(patientId);
  }

  /**
   * Obtener medicamentos no autorizados de un paciente
   * @param patientId ID del paciente
   * @param caregiverId ID del cuidador (si aplica)
   * @returns Lista de medicamentos no autorizados
   */
  async getUnauthorizedMedicines(patientId: number, caregiverId?: number): Promise<ControlMedicine[]> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.medicineRepository.getUnauthorizedMedicines(patientId);
  }
}