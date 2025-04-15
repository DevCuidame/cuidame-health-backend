import { AppDataSource } from '../../core/config/database';
import { ICode } from './code.interface';
import { Code } from '../../models/code.model';

export class CodeService {
  private codeRepository = AppDataSource.getRepository(Code);

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
}
