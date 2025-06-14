// src/modules/health-data/health-data.repository.ts
import { AppDataSource } from '../../core/config/database';
import { Patient } from '../../models/patient.model';
import { Allergy } from '../../models/allergy.model';
import { Background, FamilyBackground, Vaccine } from '../../models/background.model';
import { Condition } from '../../models/condition.model';
import { Disease } from '../../models/diseases.model';
import { HeartRate, BloodPressure, BloodGlucose, BloodOxygen, RespiratoryRate } from '../../models/vitals.models';
import { Appointment } from '../../models/appointment.model';
import { ControlMedicine } from '../../models/control-medicine.model';
import { QuestionnaireResponse } from '../../models/questionnaire.model';

export class HealthDataRepository {
  private patientRepository = AppDataSource.getRepository(Patient);
  private allergiesRepository = AppDataSource.getRepository(Allergy);
  private conditionRepository = AppDataSource.getRepository(Condition);
  private backgroundsRepository = AppDataSource.getRepository(Background);
  private familyBackgroundsRepository = AppDataSource.getRepository(FamilyBackground);
  private vaccinesRepository = AppDataSource.getRepository(Vaccine);
  private diseasesRepository = AppDataSource.getRepository(Disease);
  private heartRateRepository = AppDataSource.getRepository(HeartRate);
  private bloodPressureRepository = AppDataSource.getRepository(BloodPressure);
  private bloodGlucoseRepository = AppDataSource.getRepository(BloodGlucose);
  private bloodOxygenRepository = AppDataSource.getRepository(BloodOxygen);
  private respiratoryRateRepository = AppDataSource.getRepository(RespiratoryRate);
  private appointmentsRepository = AppDataSource.getRepository(Appointment);
  private controlMedicineRepository = AppDataSource.getRepository(ControlMedicine);
  private questionnaireResponseRepository = AppDataSource.getRepository(QuestionnaireResponse);

  /**
   * Obtiene los datos de salud de un paciente por su ID
   * @param patientId ID del paciente
   * @returns Datos de salud del paciente
   */
  async getHealthDataById(patientId: number): Promise<any> {
    // Verificar que el paciente existe
    const patient = await this.patientRepository.findOne({
      where: { id: patientId }
    });

    if (!patient) {
      return null;
    }

    // Obtener todos los datos de salud en paralelo para mejor rendimiento
    const [
      allergies,
      condition,
      backgrounds,
      familyBackgrounds,
      vaccines,
      diseases,
      appointments,
      controlMedicines,
      questionnaireResponses,
      heartRate,
      bloodPressure,
      bloodGlucose,
      bloodOxygen,
      respiratoryRate
    ] = await Promise.all([
      // Información médica
      this.allergiesRepository.find({
        where: { id_paciente: patientId },
        order: { created_at: 'DESC' }
      }),
      this.conditionRepository.findOne({
        where: { id_paciente: patientId }
      }),
      this.backgroundsRepository.find({
        where: { id_paciente: patientId },
        order: { created_at: 'DESC' }
      }),
      this.familyBackgroundsRepository.find({
        where: { id_paciente: patientId },
        order: { created_at: 'DESC' }
      }),
      this.vaccinesRepository.find({
        where: { id_paciente: patientId },
        order: { created_at: 'DESC' }
      }),
      this.diseasesRepository.find({
        where: { id_paciente: patientId },
        order: { created_at: 'DESC' }
      }),
      
      // Citas médicas
      this.appointmentsRepository.find({
        where: { patient_id: patientId },
        order: { start_time: 'DESC' },
        relations: ['professional', 'appointmentType']
      }),
      
      // Medicamentos controlados
      this.controlMedicineRepository.find({
        where: { id_patient: patientId },
        order: { date_order: 'DESC' }
      }),
      
      // Respuestas de cuestionarios
      this.questionnaireResponseRepository.find({
        where: { patient_id: patientId },
        order: { completed_at: 'DESC' },
        relations: ['questionnaire', 'responses', 'responses.question']
      }),
      
      // Signos vitales - obtener solo el más reciente para cada tipo
      this.heartRateRepository.findOne({
        where: { patient_id: patientId },
        order: { date: 'DESC' }
      }),
      this.bloodPressureRepository.findOne({
        where: { patient_id: patientId },
        order: { date: 'DESC' }
      }),
      this.bloodGlucoseRepository.findOne({
        where: { patient_id: patientId },
        order: { date: 'DESC' }
      }),
      this.bloodOxygenRepository.findOne({
        where: { patient_id: patientId },
        order: { date: 'DESC' }
      }),
      this.respiratoryRateRepository.findOne({
        where: { patient_id: patientId },
        order: { date: 'DESC' }
      })
    ]);

    // Estructurar los datos en el formato requerido
    return {
      vitals: {
        heartRate,
        bloodPressure,
        bloodGlucose,
        bloodOxygen,
        respiratoryRate
      },
      medical_info: {
        allergies,
        condition,
        backgrounds,
        familyBackgrounds,
        vaccines,
        diseases
      },
      appointments: appointments,
      medications: controlMedicines,
      questionnaire_responses: questionnaireResponses
    };
  }
}