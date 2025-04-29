// src/modules/appointment/appointment-type.service.ts
import { AppointmentTypeRepository } from '../repositories/appointment-type.repository';
import { AppointmentType } from '../../../models/appointment-type.model';
import { NotFoundError, BadRequestError } from '../../../utils/error-handler';

export class AppointmentTypeService {
  private appointmentTypeRepository: AppointmentTypeRepository;

  constructor() {
    this.appointmentTypeRepository = new AppointmentTypeRepository();
  }

  /**
   * Obtener todos los tipos de cita
   */
  async getAllTypes(): Promise<AppointmentType[]> {
    return await this.appointmentTypeRepository.findAll();
  }

  /**
   * Obtener tipos de cita activos
   */
  async getActiveTypes(): Promise<AppointmentType[]> {
    return await this.appointmentTypeRepository.getActiveTypes();
  }

  /**
   * Obtener un tipo de cita por ID
   */
  async getTypeById(id: number): Promise<AppointmentType> {
    const appointmentType = await this.appointmentTypeRepository.findById(id);

    if (!appointmentType) {
      throw new NotFoundError(`Tipo de cita con ID ${id} no encontrado`);
    }

    return appointmentType;
  }

  /**
   * Crear un nuevo tipo de cita
   */
  async createType(data: Partial<AppointmentType>): Promise<AppointmentType> {
    // Verificar si ya existe un tipo con el mismo nombre
    const existingTypes = await this.appointmentTypeRepository.findAll({
      where: { name: data.name as string }
    });
  
    if (existingTypes && existingTypes.length > 0) {
      throw new BadRequestError(`Ya existe un tipo de cita con el nombre ${data.name}`);
    }
  
    return await this.appointmentTypeRepository.create(data);
  }

  /**
   * Actualizar un tipo de cita
   */
  async updateType(id: number, data: Partial<AppointmentType>): Promise<AppointmentType> {
    // Verificar que el tipo existe
    await this.getTypeById(id);
  
    // Si se está actualizando el nombre, verificar que no exista otro tipo con ese nombre
    if (data.name) {
      const existingTypes = await this.appointmentTypeRepository.findAll({
        where: { name: data.name }
      });
  
      if (existingTypes && existingTypes.length > 0 && existingTypes[0].id !== id) {
        throw new BadRequestError(`Ya existe un tipo de cita con el nombre ${data.name}`);
      }
    }
  
    return await this.appointmentTypeRepository.update(id, data, 'Tipo de cita');
  }

  /**
   * Eliminar/desactivar un tipo de cita
   */
  async deleteType(id: number): Promise<{ success: boolean; message: string }> {
    // Verificar que el tipo existe
    await this.getTypeById(id);

    // En lugar de eliminar, marcar como inactivo
    await this.appointmentTypeRepository.update(id, { is_active: false }, 'Tipo de cita');

    return {
      success: true,
      message: 'Tipo de cita desactivado correctamente'
    };
  }
}