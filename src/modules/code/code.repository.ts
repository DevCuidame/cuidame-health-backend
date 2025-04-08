// src/modules/code/code.repository.ts
import { AppDataSource } from '../../core/config/database';
import { NotFoundError } from '../../utils/error-handler';

export class CodeRepository {
  /**
   * Obtiene un código disponible para asignar a un paciente
   * @param license Tipo de licencia (por defecto 'Health')
   * @param agreement Tipo de acuerdo (por defecto 'Free')
   * @returns El hashcode disponible
   * @throws NotFoundError si no hay códigos disponibles
   */
  async getAvailableCodeForPatient(license: string = 'Health', agreement: string = 'Free'): Promise<string> {
    // Ejecutar la consulta personalizada para obtener un código disponible
    const result = await AppDataSource.query(`
      SELECT c.hashcode, c.code
      FROM codes c
      LEFT JOIN pacientes p ON c.hashcode = p.hashcode
      WHERE p.code IS NULL AND c.license = $1 AND c.agreement = $2 AND c.status = 'inactive'
      LIMIT 1
    `, [license, agreement]);

    // Verificar si se encontró un código disponible
    if (!result || result.length === 0) {
      throw new NotFoundError('No hay códigos disponibles para asignar');
    }

    // Marcar el código como utilizado
    await AppDataSource.query(`
      UPDATE codes
      SET status = 'active'
      WHERE hashcode = $1
    `, [result[0].hashcode]);

    // Devolver el hashcode
    return result[0].hashcode;
  }

  /**
   * Libera un código cuando se elimina un paciente
   * @param hashcode El hashcode a liberar
   */
  async releaseCode(hashcode: string): Promise<void> {
    await AppDataSource.query(`
      UPDATE codes
      SET status = 'inactive'
      WHERE hashcode = $1
    `, [hashcode]);
  }
}