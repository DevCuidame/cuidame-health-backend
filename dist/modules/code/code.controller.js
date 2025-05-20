"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeController = void 0;
const code_service_1 = require("./code.service");
class CodeController {
    codeService;
    constructor() {
        this.codeService = new code_service_1.CodeService();
    }
    /**
     * Obtener todos los acuerdos
     * @route GET /api/code/agreements
     */
    getAgreements = async (req, res, next) => {
        try {
            const agreements = await this.codeService.getAllAgreements();
            const response = {
                success: true,
                data: agreements,
                timestamp: new Date().toISOString(),
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
    * Autentica un código de banda para un paciente
    * @route POST /api/code/authenticate
    */
    authenticateBand = async (req, res, next) => {
        try {
            const { code, agreement } = req.body;
            console.log("🚀 ~ CodeController ~ authenticateBand= ~ req.body:", req.body);
            console.log("🚀 ~ CodeController ~ authenticateBand= ~ code:", code, agreement);
            const result = await this.codeService.authenticateBand(code, agreement);
            const response = {
                success: result.success,
                message: result.message,
                data: result.data,
                timestamp: new Date().toISOString()
            };
            res.status(201).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.CodeController = CodeController;
