// src/modules/patient/patient.repository.ts
import { FindOneOptions } from 'typeorm';
import { BaseRepository } from '../../core/repositories/base.repository';
import { MedicalSpecialties } from '../../models/medical-specialties.model';

export class MedicalSpecialtyRepository extends BaseRepository<MedicalSpecialties> {
  constructor() {
    super(MedicalSpecialties);
  }

  async findByName(name: string): Promise<MedicalSpecialties | null> {
    return await this.repository.findOne({
      where: { name }
    });
  }
}
