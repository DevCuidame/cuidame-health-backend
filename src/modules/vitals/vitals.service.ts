import { HealthService } from '../health/health.service';
import {
  CreateHeartRateDto,
  CreateBloodPressureDto,
  CreateBloodGlucoseDto,
  CreateBloodOxygenDto,
  CreateRespiratoryRateDto
} from '../health/health.dto';
import { BloodGlucose, BloodOxygen, BloodPressure, HeartRate, RespiratoryRate } from '../../models/vitals.models';

export class VitalsService {
  private healthService: HealthService;

  constructor() {
    this.healthService = new HealthService();
  }

  /**
   * Obtener registros de frecuencia cardíaca de un paciente
   * @param patientId ID del paciente
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Lista de registros de frecuencia cardíaca
   */
  async getHeartRatesByPatient(patientId: number, userId?: number): Promise<HeartRate[]> {
    return await this.healthService.getHeartRatesByPatient(patientId, undefined, undefined, userId);
  }

  /**
   * Crear un nuevo registro de frecuencia cardíaca
   * @param data Datos del registro
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Registro creado
   */
  async createHeartRate(data: CreateHeartRateDto, userId?: number): Promise<HeartRate> {
    return await this.healthService.createHeartRate(data, userId);
  }

  /**
   * Actualizar un registro de frecuencia cardíaca
   * @param id ID del registro
   * @param data Datos actualizados
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Registro actualizado
   */
  async updateHeartRate(id: number, data: Partial<HeartRate>, userId?: number): Promise<HeartRate> {
    // Primero obtener el registro existente para verificar permisos
    const heartRate = await this.healthService.getHeartRateById(id, userId);
    
    // Actualizar solo los campos permitidos
    const updateData: any = {};
    if (data.rate !== undefined) updateData.rate = data.rate;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    
    return await this.healthService['healthRepository'].updateHeartRate(id, updateData);
  }

  /**
   * Eliminar un registro de frecuencia cardíaca
   * @param id ID del registro
   * @param userId ID del cuidador (para verificación de permisos)
   */
  async deleteHeartRate(id: number, userId?: number): Promise<void> {
    // Primero obtener el registro existente para verificar permisos
    const heartRate = await this.healthService.getHeartRateById(id, userId);
    
    await this.healthService['healthRepository'].deleteHeartRate(id);
  }

  /**
   * Obtener registros de presión arterial de un paciente
   * @param patientId ID del paciente
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Lista de registros de presión arterial
   */
  async getBloodPressuresByPatient(patientId: number, userId?: number): Promise<BloodPressure[]> {
    return await this.healthService.getBloodPressuresByPatient(patientId, undefined, undefined, userId);
  }

  /**
   * Crear un nuevo registro de presión arterial
   * @param data Datos del registro
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Registro creado
   */
  async createBloodPressure(data: CreateBloodPressureDto, userId?: number): Promise<BloodPressure> {
    return await this.healthService.createBloodPressure(data, userId);
  }

  /**
   * Actualizar un registro de presión arterial
   * @param id ID del registro
   * @param data Datos actualizados
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Registro actualizado
   */
  async updateBloodPressure(id: number, data: Partial<BloodPressure>, userId?: number): Promise<BloodPressure> {
    // Primero obtener el registro existente para verificar permisos
    const bloodPressure = await this.healthService.getBloodPressureById(id, userId);
    
    // Actualizar solo los campos permitidos
    const updateData: any = {};
    if (data.systolic !== undefined) updateData.systolic = data.systolic;
    if (data.diastolic !== undefined) updateData.diastolic = data.diastolic;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    
    return await this.healthService['healthRepository'].updateBloodPressure(id, updateData);
  }

  /**
   * Eliminar un registro de presión arterial
   * @param id ID del registro
   * @param userId ID del cuidador (para verificación de permisos)
   */
  async deleteBloodPressure(id: number, userId?: number): Promise<void> {
    // Primero obtener el registro existente para verificar permisos
    const bloodPressure = await this.healthService.getBloodPressureById(id, userId);
    
    await this.healthService['healthRepository'].deleteBloodPressure(id);
  }

  /**
   * Obtener registros de glucosa en sangre de un paciente
   * @param patientId ID del paciente
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Lista de registros de glucosa en sangre
   */
  async getBloodGlucosesByPatient(patientId: number, userId?: number): Promise<BloodGlucose[]> {
    return await this.healthService.getBloodGlucosesByPatient(patientId, undefined, undefined, userId);
  }

  /**
   * Crear un nuevo registro de glucosa en sangre
   * @param data Datos del registro
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Registro creado
   */
  async createBloodGlucose(data: CreateBloodGlucoseDto, userId?: number): Promise<BloodGlucose> {
    return await this.healthService.createBloodGlucose(data, userId);
  }

  /**
   * Actualizar un registro de glucosa en sangre
   * @param id ID del registro
   * @param data Datos actualizados
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Registro actualizado
   */
  async updateBloodGlucose(id: number, data: Partial<BloodGlucose>, userId?: number): Promise<BloodGlucose> {
    // Primero obtener el registro existente para verificar permisos
    const bloodGlucose = await this.healthService.getBloodGlucoseById(id, userId);
    
    // Actualizar solo los campos permitidos
    const updateData: any = {};
    if (data.rate !== undefined) updateData.rate = data.rate;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    
    return await this.healthService['healthRepository'].updateBloodGlucose(id, updateData);
  }

  /**
   * Eliminar un registro de glucosa en sangre
   * @param id ID del registro
   * @param userId ID del cuidador (para verificación de permisos)
   */
  async deleteBloodGlucose(id: number, userId?: number): Promise<void> {
    // Primero obtener el registro existente para verificar permisos
    const bloodGlucose = await this.healthService.getBloodGlucoseById(id, userId);
    
    await this.healthService['healthRepository'].deleteBloodGlucose(id);
  }

  /**
   * Obtener registros de oxígeno en sangre de un paciente
   * @param patientId ID del paciente
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Lista de registros de oxígeno en sangre
   */
  async getBloodOxygensByPatient(patientId: number, userId?: number): Promise<BloodOxygen[]> {
    return await this.healthService.getBloodOxygensByPatient(patientId, undefined, undefined, userId);
  }

  /**
   * Crear un nuevo registro de oxígeno en sangre
   * @param data Datos del registro
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Registro creado
   */
  async createBloodOxygen(data: CreateBloodOxygenDto, userId?: number): Promise<BloodOxygen> {
    return await this.healthService.createBloodOxygen(data, userId);
  }

  /**
   * Actualizar un registro de oxígeno en sangre
   * @param id ID del registro
   * @param data Datos actualizados
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Registro actualizado
   */
  async updateBloodOxygen(id: number, data: Partial<BloodOxygen>, userId?: number): Promise<BloodOxygen> {
    // Primero obtener el registro existente para verificar permisos
    const bloodOxygen = await this.healthService.getBloodOxygenById(id, userId);
    
    // Actualizar solo los campos permitidos
    const updateData: any = {};
    if (data.rate !== undefined) updateData.rate = data.rate;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    
    return await this.healthService['healthRepository'].updateBloodOxygen(id, updateData);
  }

  /**
   * Eliminar un registro de oxígeno en sangre
   * @param id ID del registro
   * @param userId ID del cuidador (para verificación de permisos)
   */
  async deleteBloodOxygen(id: number, userId?: number): Promise<void> {
    // Primero obtener el registro existente para verificar permisos
    const bloodOxygen = await this.healthService.getBloodOxygenById(id, userId);
    
    await this.healthService['healthRepository'].deleteBloodOxygen(id);
  }

  /**
   * Obtener registros de frecuencia respiratoria de un paciente
   * @param patientId ID del paciente
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Lista de registros de frecuencia respiratoria
   */
  async getRespiratoryRatesByPatient(patientId: number, userId?: number): Promise<RespiratoryRate[]> {
    return await this.healthService.getRespiratoryRatesByPatient(patientId, undefined, undefined, userId);
  }

  /**
   * Crear un nuevo registro de frecuencia respiratoria
   * @param data Datos del registro
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Registro creado
   */
  async createRespiratoryRate(data: CreateRespiratoryRateDto, userId?: number): Promise<RespiratoryRate> {
    return await this.healthService.createRespiratoryRate(data, userId);
  }

  /**
   * Actualizar un registro de frecuencia respiratoria
   * @param id ID del registro
   * @param data Datos actualizados
   * @param userId ID del cuidador (para verificación de permisos)
   * @returns Registro actualizado
   */
  async updateRespiratoryRate(id: number, data: Partial<RespiratoryRate>, userId?: number): Promise<RespiratoryRate> {
    // Primero obtener el registro existente para verificar permisos
    const respiratoryRate = await this.healthService.getRespiratoryRateById(id, userId);
    
    // Actualizar solo los campos permitidos
    const updateData: any = {};
    if (data.rate !== undefined) updateData.rate = data.rate;
    if (data.date !== undefined) updateData.date = new Date(data.date);
    
    return await this.healthService['healthRepository'].updateRespiratoryRate(id, updateData);
  }

/**
   * Eliminar un registro de frecuencia respiratoria
   * @param id ID del registro
   * @param userId ID del cuidador (para verificación de permisos)
   */
async deleteRespiratoryRate(id: number, userId?: number): Promise<void> {
    // Primero obtener el registro existente para verificar permisos
    const respiratoryRate = await this.healthService.getRespiratoryRateById(id, userId);
    
    await this.healthService['healthRepository'].deleteRespiratoryRate(id);
  }
}