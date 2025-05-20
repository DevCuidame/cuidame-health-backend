"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeService = void 0;
const database_1 = require("../../core/config/database");
const code_model_1 = require("../../models/code.model");
const code_repository_1 = require("./code.repository");
const error_handler_1 = require("../../utils/error-handler");
class CodeService {
    codeRepository = database_1.AppDataSource.getRepository(code_model_1.Code);
    bandAuth;
    constructor() {
        this.bandAuth = new code_repository_1.CodeRepository();
    }
    /**
     * Obtener todos los acuerdos únicos
     * @returns Lista de acuerdos únicos
     */
    async getAllAgreements() {
        const codes = await this.codeRepository.find({
            order: {
                agreement: 'ASC',
            },
        });
        // Usar Set para obtener valores únicos de acuerdos
        const uniqueAgreements = [
            ...new Set(codes
                .filter((code) => code.agreement) // Filtrar valores nulos o undefined
                .map((code) => code.agreement)),
        ];
        // Convertir a la interfaz ICode
        return uniqueAgreements.map((agreement) => ({
            agreement: agreement,
        }));
    }
    /**
     * Autentica un código de banda para un paciente
     * @param code Código de la banda
     * @param pin PIN asociado al código
     * @param agreement Tipo de acuerdo seleccionado
     */
    async authenticateBand(code, agreement) {
        // Buscar el código en la base de datos
        const myBand = await this.bandAuth.findByCode(code);
        if (!myBand) {
            throw new error_handler_1.BadRequestError('No hemos podido identificar este código, por favor revisa e ingresa nuevamente');
        }
        // Verificar si el código tiene un acuerdo asociado
        const hasAgreement = await this.bandAuth.hasAgreement(code);
        if (!hasAgreement || !hasAgreement.has_agreement) {
            throw new error_handler_1.BadRequestError('Este código no tiene un seguro para tu mascota');
        }
        else if (hasAgreement.agreement !== agreement) {
            throw new error_handler_1.BadRequestError('Este código no coincide con el seguro seleccionado');
        }
        // Verificar si el código ya está siendo usado
        const personCode = await this.bandAuth.findPersonBand(code);
        if (personCode) {
            throw new error_handler_1.BadRequestError('Este código ya se encuentra en uso');
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
    async findByCode(code) {
        return await this.codeRepository.findOne({
            where: { code },
        });
    }
    /**
     * Verifica si un código tiene un acuerdo válido
     * @param code Código a verificar
     * @returns Información sobre el acuerdo
     */
    async verifyAgreement(code) {
        const codeRecord = await this.findByCode(code);
        if (!codeRecord) {
            return null;
        }
        return {
            has_agreement: codeRecord.agreement !== null &&
                codeRecord.agreement !== undefined &&
                codeRecord.agreement !== '',
            agreement: codeRecord.agreement || '',
        };
    }
}
exports.CodeService = CodeService;
