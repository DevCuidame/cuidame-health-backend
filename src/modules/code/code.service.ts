import { AppDataSource } from '../../core/config/database';
import { IBandAuthResponse, ICode } from './code.interface';
import { Code } from '../../models/code.model';
import { CodeRepository } from './code.repository';
import { BadRequestError } from '../../utils/error-handler';

export class CodeService {
  private codeRepository = AppDataSource.getRepository(Code);
  private bandAuth: CodeRepository;

  constructor() {
    this.bandAuth = new CodeRepository();
  }

  /**
   * Obtener todos los acuerdos únicos
   * @returns Lista de acuerdos únicos
   */
  async getAllAgreements(): Promise<ICode[]> {
    const codes = await this.codeRepository.find({
      order: {
        agreement: 'ASC',
      },
    });

    // Usar Set para obtener valores únicos de acuerdos
    const uniqueAgreements = [
      ...new Set(
        codes
          .filter((code) => code.agreement) // Filtrar valores nulos o undefined
          .map((code) => code.agreement)
      ),
    ];

    // Convertir a la interfaz ICode
    return uniqueAgreements.map((agreement) => ({
      agreement: agreement as string,
    }));
  }
  /**
   * Autentica un código de banda para un paciente
   * @param code Código de la banda
   * @param pin PIN asociado al código
   * @param agreement Tipo de acuerdo seleccionado
   */
  async authenticateBand(
    code: string,
    agreement: string
  ): Promise<IBandAuthResponse> {
    // Buscar el código en la base de datos
    const myBand = await this.bandAuth.findByCode(code);

    if (!myBand) {
      throw new BadRequestError(
        'No hemos podido identificar este código, por favor revisa e ingresa nuevamente'
      );
    }

    // Verificar si el código tiene un acuerdo asociado
    const hasAgreement = await this.bandAuth.hasAgreement(code);

    if (!hasAgreement || !hasAgreement.has_agreement) {
      throw new BadRequestError(
        'Este código no tiene un seguro para tu mascota'
      );
    } else if (hasAgreement.agreement !== agreement) {
      throw new BadRequestError(
        'Este código no coincide con el seguro seleccionado'
      );
    }

    // Verificar si el código ya está siendo usado
    const personCode = await this.bandAuth.findPersonBand(code);

    if (personCode) {
      throw new BadRequestError('Este código ya se encuentra en uso');
    }

    return {
      success: true,
      message: 'Código autenticado correctamente',
      data: null,
    };
  }

  /**
   * Busca un código por su valor
   * @param code Código a buscar
   * @returns Información del código encontrado
   */
  async findByCode(code: string): Promise<Code | null> {
    return await this.codeRepository.findOne({
      where: { code },
    });
  }

  /**
   * Verifica si un código está en uso en las tablas pacientes o mascotas
   * @param code Código a verificar
   * @returns true si el código está en uso, false si está disponible
   */
  async isCodeInUse(code: string): Promise<boolean> {
    // Verificar en tabla pacientes
    const patientResult = await AppDataSource.query(
      `
      SELECT 1
      FROM pacientes
      WHERE code = $1
      LIMIT 1;
      `,
      [code]
    );

    if (patientResult.length > 0) {
      return true;
    }

    // Verificar en tabla mascotas
    const petResult = await AppDataSource.query(
      `
      SELECT 1
      FROM mascotas
      WHERE hashcode = $1
      LIMIT 1;
      `,
      [code]
    );

    return petResult.length > 0;
  }

  /**
   * Verifica si un código tiene un acuerdo válido
   * @param code Código a verificar
   * @returns Información sobre el acuerdo
   */
  async verifyAgreement(
    code: string
  ): Promise<{ has_agreement: boolean; agreement: string } | null> {
    const codeRecord = await this.findByCode(code);

    if (!codeRecord) {
      return null;
    }

    return {
      has_agreement:
        codeRecord.agreement !== null &&
        codeRecord.agreement !== undefined &&
        codeRecord.agreement !== '',
      agreement: codeRecord.agreement || '',
    };
  }
}
