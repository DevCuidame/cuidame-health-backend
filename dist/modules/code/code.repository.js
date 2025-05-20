"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeRepository = void 0;
// src/modules/code/code.repository.ts
const database_1 = require("../../core/config/database");
const error_handler_1 = require("../../utils/error-handler");
class CodeRepository {
    /**
     * Obtiene un código disponible para asignar a un paciente
     * @param license Tipo de licencia (por defecto 'Health')
     * @param agreement Tipo de acuerdo (por defecto 'Free')
     * @returns El hashcode disponible
     * @throws NotFoundError si no hay códigos disponibles
     */
    async getAvailableCodeForPatient(license = 'Health', agreement = 'Free') {
        // Ejecutar la consulta personalizada para obtener un código disponible
        const result = await database_1.AppDataSource.query(`
      SELECT c.hashcode, c.code
      FROM codes c
      LEFT JOIN pacientes p ON c.hashcode = p.code
      WHERE p.code IS NULL AND c.license = $1 AND c.agreement = $2 AND c.status = 'inactive'
      LIMIT 1
    `, [license, agreement]);
        // Verificar si se encontró un código disponible
        if (!result || result.length === 0) {
            throw new error_handler_1.NotFoundError('No hay códigos disponibles para asignar');
        }
        // Marcar el código como utilizado
        await database_1.AppDataSource.query(`
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
    async releaseCode(hashcode) {
        await database_1.AppDataSource.query(`
      UPDATE codes
      SET status = 'inactive'
      WHERE hashcode = $1
    `, [hashcode]);
    }
    /**
     * Busca un código en la base de datos
     * @param code Código a buscar
     * @returns Información del código o null si no existe
     */
    async findByCode(code) {
        const result = await database_1.AppDataSource.query(`
      SELECT 
          * 
      FROM 
          codes
      WHERE
          code = $1
      `, [code]);
        return result.length > 0 ? result[0] : null;
    }
    /**
     * Verifica si un código ya está siendo usado por un paciente
     * @param code Código a verificar
     * @returns Información del paciente o null si no existe
     */
    async findPersonBand(code) {
        const result = await database_1.AppDataSource.query(`
      SELECT nombre
      FROM pacientes
      WHERE code = (
        SELECT hashcode 
        FROM codes 
        WHERE code = $1
      );
      `, [code]);
        return result.length > 0 ? result[0] : null;
    }
    /**
     * Verifica si un código tiene un acuerdo asociado
     * @param code Código a verificar
     * @returns Información sobre el acuerdo o null si no existe
     */
    async hasAgreement(code) {
        const result = await database_1.AppDataSource.query(`
          SELECT EXISTS (
            SELECT 1
            FROM codes
            WHERE code = $1 AND (agreement IS NOT NULL AND agreement != '')
          ) AS has_agreement,
          agreement
          FROM codes
          WHERE code = $1;
          `, [code]);
        return result.length > 0 ? result[0] : null;
    }
}
exports.CodeRepository = CodeRepository;
