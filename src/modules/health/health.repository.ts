import { BloodGlucose, BloodOxygen, BloodPressure, HeartRate, RespiratoryRate } from '../../models/vitals.models';
import { AppDataSource } from '../../core/config/database';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';

/**
 * Repositorio para gestionar los signos vitales de los pacientes
 */
export class HealthRepository {
  private heartRateRepository: Repository<HeartRate>;
  private bloodPressureRepository: Repository<BloodPressure>;
  private bloodGlucoseRepository: Repository<BloodGlucose>;
  private bloodOxygenRepository: Repository<BloodOxygen>;
  private respiratoryRateRepository: Repository<RespiratoryRate>;

  constructor() {
    this.heartRateRepository = AppDataSource.getRepository(HeartRate);
    this.bloodPressureRepository = AppDataSource.getRepository(BloodPressure);
    this.bloodGlucoseRepository = AppDataSource.getRepository(BloodGlucose);
    this.bloodOxygenRepository = AppDataSource.getRepository(BloodOxygen);
    this.respiratoryRateRepository = AppDataSource.getRepository(RespiratoryRate);
  }

  // Métodos para frecuencia cardíaca
  async createHeartRate(data: Partial<HeartRate>): Promise<HeartRate> {
    const heartRate = this.heartRateRepository.create(data);
    return await this.heartRateRepository.save(heartRate);
  }

  async getHeartRateById(id: number): Promise<HeartRate | null> {
    return await this.heartRateRepository.findOne({
      where: { id },
      relations: ['patient']
    });
  }

  async getHeartRatesByPatient(patientId: number, startDate?: Date, endDate?: Date): Promise<HeartRate[]> {
    const query: any = { patient_id: patientId };
    
    if (startDate && endDate) {
      query.date = Between(startDate, endDate);
    } else if (startDate) {
      query.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      query.date = LessThanOrEqual(endDate);
    }
    
    return await this.heartRateRepository.find({
      where: query,
      order: { date: 'DESC' }
    });
  }

  async getLatestHeartRate(patientId: number): Promise<HeartRate | null> {
    return await this.heartRateRepository.findOne({
      where: { patient_id: patientId },
      order: { date: 'DESC' }
    });
  }

  // Métodos para presión arterial
  async createBloodPressure(data: Partial<BloodPressure>): Promise<BloodPressure> {
    const bloodPressure = this.bloodPressureRepository.create(data);
    return await this.bloodPressureRepository.save(bloodPressure);
  }

  async getBloodPressureById(id: number): Promise<BloodPressure | null> {
    return await this.bloodPressureRepository.findOne({
      where: { id },
      relations: ['patient']
    });
  }

  async getBloodPressuresByPatient(patientId: number, startDate?: Date, endDate?: Date): Promise<BloodPressure[]> {
    const query: any = { patient_id: patientId };
    
    if (startDate && endDate) {
      query.date = Between(startDate, endDate);
    } else if (startDate) {
      query.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      query.date = LessThanOrEqual(endDate);
    }
    
    return await this.bloodPressureRepository.find({
      where: query,
      order: { date: 'DESC' }
    });
  }

  async getLatestBloodPressure(patientId: number): Promise<BloodPressure | null> {
    return await this.bloodPressureRepository.findOne({
      where: { patient_id: patientId },
      order: { date: 'DESC' }
    });
  }

  // Métodos para glucosa en sangre
  async createBloodGlucose(data: Partial<BloodGlucose>): Promise<BloodGlucose> {
    const bloodGlucose = this.bloodGlucoseRepository.create(data);
    return await this.bloodGlucoseRepository.save(bloodGlucose);
  }

  async getBloodGlucoseById(id: number): Promise<BloodGlucose | null> {
    return await this.bloodGlucoseRepository.findOne({
      where: { id },
      relations: ['patient']
    });
  }

  async getBloodGlucosesByPatient(patientId: number, startDate?: Date, endDate?: Date): Promise<BloodGlucose[]> {
    const query: any = { patient_id: patientId };
    
    if (startDate && endDate) {
      query.date = Between(startDate, endDate);
    } else if (startDate) {
      query.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      query.date = LessThanOrEqual(endDate);
    }
    
    return await this.bloodGlucoseRepository.find({
      where: query,
      order: { date: 'DESC' }
    });
  }

  async getLatestBloodGlucose(patientId: number): Promise<BloodGlucose | null> {
    return await this.bloodGlucoseRepository.findOne({
      where: { patient_id: patientId },
      order: { date: 'DESC' }
    });
  }

  // Métodos para oxígeno en sangre
  async createBloodOxygen(data: Partial<BloodOxygen>): Promise<BloodOxygen> {
    const bloodOxygen = this.bloodOxygenRepository.create(data);
    return await this.bloodOxygenRepository.save(bloodOxygen);
  }

  async getBloodOxygenById(id: number): Promise<BloodOxygen | null> {
    return await this.bloodOxygenRepository.findOne({
      where: { id },
      relations: ['patient']
    });
  }

  async getBloodOxygensByPatient(patientId: number, startDate?: Date, endDate?: Date): Promise<BloodOxygen[]> {
    const query: any = { patient_id: patientId };
    
    if (startDate && endDate) {
      query.date = Between(startDate, endDate);
    } else if (startDate) {
      query.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      query.date = LessThanOrEqual(endDate);
    }
    
    return await this.bloodOxygenRepository.find({
      where: query,
      order: { date: 'DESC' }
    });
  }

  async getLatestBloodOxygen(patientId: number): Promise<BloodOxygen | null> {
    return await this.bloodOxygenRepository.findOne({
      where: { patient_id: patientId },
      order: { date: 'DESC' }
    });
  }

  // Métodos para frecuencia respiratoria
  async createRespiratoryRate(data: Partial<RespiratoryRate>): Promise<RespiratoryRate> {
    const respiratoryRate = this.respiratoryRateRepository.create(data);
    return await this.respiratoryRateRepository.save(respiratoryRate);
  }

  async getRespiratoryRateById(id: number): Promise<RespiratoryRate | null> {
    return await this.respiratoryRateRepository.findOne({
      where: { id },
      relations: ['patient']
    });
  }

  async getRespiratoryRatesByPatient(patientId: number, startDate?: Date, endDate?: Date): Promise<RespiratoryRate[]> {
    const query: any = { patient_id: patientId };
    
    if (startDate && endDate) {
      query.date = Between(startDate, endDate);
    } else if (startDate) {
      query.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      query.date = LessThanOrEqual(endDate);
    }
    
    return await this.respiratoryRateRepository.find({
      where: query,
      order: { date: 'DESC' }
    });
  }

  async getLatestRespiratoryRate(patientId: number): Promise<RespiratoryRate | null> {
    return await this.respiratoryRateRepository.findOne({
      where: { patient_id: patientId },
      order: { date: 'DESC' }
    });
  }

  // Métodos para obtener todos los signos vitales más recientes
  async getLatestVitals(patientId: number): Promise<{
    heartRate: HeartRate | null;
    bloodPressure: BloodPressure | null;
    bloodGlucose: BloodGlucose | null;
    bloodOxygen: BloodOxygen | null;
    respiratoryRate: RespiratoryRate | null;
  }> {
    const [heartRate, bloodPressure, bloodGlucose, bloodOxygen, respiratoryRate] = await Promise.all([
      this.getLatestHeartRate(patientId),
      this.getLatestBloodPressure(patientId),
      this.getLatestBloodGlucose(patientId),
      this.getLatestBloodOxygen(patientId),
      this.getLatestRespiratoryRate(patientId)
    ]);

    return {
      heartRate,
      bloodPressure,
      bloodGlucose,
      bloodOxygen,
      respiratoryRate
    };
  }
}