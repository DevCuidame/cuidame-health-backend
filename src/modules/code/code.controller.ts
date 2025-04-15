import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from 'src/core/interfaces/response.interface';
import { CodeService } from './code.service';

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
}
