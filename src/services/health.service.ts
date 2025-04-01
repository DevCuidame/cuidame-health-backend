import { HealthRepository } from '../repositories/health.repository';
import { PatientRepository } from '../repositories/patient.repository';
import { HeartRate, BloodPressure, BloodGlucose, BloodOxygen, RespiratoryRate } from '../models/vitals.models';
import { NotFoundError, ForbiddenError } from '../utils/error-handler';
import { 
  CreateHeartRateDto, 
  CreateBloodPressureDto, 
  CreateBloodGlucoseDto, 
  CreateBloodOxygenDto, 
  CreateRespiratoryRateDto 
} from '../dto/health.dto';

export class HealthService {
  private healthRepository: HealthRepository;
  private patientRepository: PatientRepository;

  constructor() {
    this.healthRepository = new HealthRepository();
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

  // Métodos para frecuencia cardíaca
  async createHeartRate(data: CreateHeartRateDto, caregiverId?: number): Promise<HeartRate> {
    await this.verifyAccess(data.patient_id, caregiverId);
    
    return await this.healthRepository.createHeartRate({
      ...data,
      date: new Date(data.date),
      created_at: new Date()
    });
  }

  async getHeartRateById(id: number, caregiverId?: number): Promise<HeartRate> {
    const heartRate = await this.healthRepository.getHeartRateById(id);
    
    if (!heartRate) {
      throw new NotFoundError(`Registro de frecuencia cardíaca con ID ${id} no encontrado`);
    }
    
    await this.verifyAccess(heartRate.patient_id, caregiverId);
    
    return heartRate;
  }

  async getHeartRatesByPatient(patientId: number, startDate?: Date, endDate?: Date, caregiverId?: number): Promise<HeartRate[]> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.healthRepository.getHeartRatesByPatient(patientId, startDate, endDate);
  }

  // Métodos para presión arterial
  async createBloodPressure(data: CreateBloodPressureDto, caregiverId?: number): Promise<BloodPressure> {
    await this.verifyAccess(data.patient_id, caregiverId);
    
    return await this.healthRepository.createBloodPressure({
      ...data,
      date: new Date(data.date),
      created_at: new Date()
    });
  }

  async getBloodPressureById(id: number, caregiverId?: number): Promise<BloodPressure> {
    const bloodPressure = await this.healthRepository.getBloodPressureById(id);
    
    if (!bloodPressure) {
      throw new NotFoundError(`Registro de presión arterial con ID ${id} no encontrado`);
    }
    
    await this.verifyAccess(bloodPressure.patient_id, caregiverId);
    
    return bloodPressure;
  }

  async getBloodPressuresByPatient(patientId: number, startDate?: Date, endDate?: Date, caregiverId?: number): Promise<BloodPressure[]> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.healthRepository.getBloodPressuresByPatient(patientId, startDate, endDate);
  }

  // Métodos para glucosa en sangre
  async createBloodGlucose(data: CreateBloodGlucoseDto, caregiverId?: number): Promise<BloodGlucose> {
    await this.verifyAccess(data.patient_id, caregiverId);
    
    return await this.healthRepository.createBloodGlucose({
      ...data,
      date: new Date(data.date)
    });
  }

  async getBloodGlucoseById(id: number, caregiverId?: number): Promise<BloodGlucose> {
    const bloodGlucose = await this.healthRepository.getBloodGlucoseById(id);
    
    if (!bloodGlucose) {
      throw new NotFoundError(`Registro de glucosa en sangre con ID ${id} no encontrado`);
    }
    
    await this.verifyAccess(bloodGlucose.patient_id, caregiverId);
    
    return bloodGlucose;
  }

  async getBloodGlucosesByPatient(patientId: number, startDate?: Date, endDate?: Date, caregiverId?: number): Promise<BloodGlucose[]> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.healthRepository.getBloodGlucosesByPatient(patientId, startDate, endDate);
  }

  // Métodos para oxígeno en sangre
  async createBloodOxygen(data: CreateBloodOxygenDto, caregiverId?: number): Promise<BloodOxygen> {
    await this.verifyAccess(data.patient_id, caregiverId);
    
    return await this.healthRepository.createBloodOxygen({
      ...data,
      date: new Date(data.date)
    });
  }

  async getBloodOxygenById(id: number, caregiverId?: number): Promise<BloodOxygen> {
    const bloodOxygen = await this.healthRepository.getBloodOxygenById(id);
    
    if (!bloodOxygen) {
      throw new NotFoundError(`Registro de oxígeno en sangre con ID ${id} no encontrado`);
    }
    
    await this.verifyAccess(bloodOxygen.patient_id, caregiverId);
    
    return bloodOxygen;
  }

  async getBloodOxygensByPatient(patientId: number, startDate?: Date, endDate?: Date, caregiverId?: number): Promise<BloodOxygen[]> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.healthRepository.getBloodOxygensByPatient(patientId, startDate, endDate);
  }

  // Métodos para frecuencia respiratoria
  async createRespiratoryRate(data: CreateRespiratoryRateDto, caregiverId?: number): Promise<RespiratoryRate> {
    await this.verifyAccess(data.patient_id, caregiverId);
    
    return await this.healthRepository.createRespiratoryRate({
      ...data,
      date: new Date(data.date),
      created_at: new Date()
    });
  }

  async getRespiratoryRateById(id: number, caregiverId?: number): Promise<RespiratoryRate> {
    const respiratoryRate = await this.healthRepository.getRespiratoryRateById(id);
    
    if (!respiratoryRate) {
      throw new NotFoundError(`Registro de frecuencia respiratoria con ID ${id} no encontrado`);
    }
    
    await this.verifyAccess(respiratoryRate.patient_id, caregiverId);
    
    return respiratoryRate;
  }

  async getRespiratoryRatesByPatient(patientId: number, startDate?: Date, endDate?: Date, caregiverId?: number): Promise<RespiratoryRate[]> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.healthRepository.getRespiratoryRatesByPatient(patientId, startDate, endDate);
  }

  // Métodos para obtener todos los signos vitales
  async getLatestVitals(patientId: number, caregiverId?: number): Promise<{
    heartRate: HeartRate | null;
    bloodPressure: BloodPressure | null;
    bloodGlucose: BloodGlucose | null;
    bloodOxygen: BloodOxygen | null;
    respiratoryRate: RespiratoryRate | null;
  }> {
    await this.verifyAccess(patientId, caregiverId);
    
    return await this.healthRepository.getLatestVitals(patientId);
  }

  async getAllVitals(patientId: number, startDate?: Date, endDate?: Date, caregiverId?: number): Promise<{
    heartRates: HeartRate[];
    bloodPressures: BloodPressure[];
    bloodGlucoses: BloodGlucose[];
    bloodOxygens: BloodOxygen[];
    respiratoryRates: RespiratoryRate[];
  }> {
    await this.verifyAccess(patientId, caregiverId);
    
    const [heartRates, bloodPressures, bloodGlucoses, bloodOxygens, respiratoryRates] = await Promise.all([
      this.healthRepository.getHeartRatesByPatient(patientId, startDate, endDate),
      this.healthRepository.getBloodPressuresByPatient(patientId, startDate, endDate),
      this.healthRepository.getBloodGlucosesByPatient(patientId, startDate, endDate),
      this.healthRepository.getBloodOxygensByPatient(patientId, startDate, endDate),
      this.healthRepository.getRespiratoryRatesByPatient(patientId, startDate, endDate)
    ]);
    
    return {
      heartRates,
      bloodPressures,
      bloodGlucoses,
      bloodOxygens,
      respiratoryRates
    };
  }
}