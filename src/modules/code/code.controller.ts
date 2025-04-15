import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from 'src/core/interfaces/response.interface';
import { CodeService } from './code.service';
import { BandAuthDto } from './code.dto';

export class CodeController {
  private codeService: CodeService;

  constructor() {
    this.codeService = new CodeService();
  }

  /**
   * Obtener todos los acuerdos
   * @route GET /api/code/agreements
   */
  getAgreements = async ( req: Request, res: Response, next: NextFunction ): Promise<void> => {
    try {
      const agreements = await this.codeService.getAllAgreements();

      const response: ApiResponse = {
        success: true,
        data: agreements,
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };


   /**
   * Autentica un código de banda para un paciente
   * @route POST /api/code/authenticate
   */
   authenticateBand = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { code, agreement }: BandAuthDto = req.body;
      console.log("🚀 ~ CodeController ~ authenticateBand= ~ req.body:", req.body)
      console.log("🚀 ~ CodeController ~ authenticateBand= ~ code:", code, agreement)

      const result = await this.codeService.authenticateBand(code, agreement);

      const response: ApiResponse = {
        success: result.success,
        message: result.message,
        data: result.data,
        timestamp: new Date().toISOString()
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

}
