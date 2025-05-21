// src/middlewares/cors.middleware.ts - COMPLETAMENTE DESACTIVADO
import { Request, Response, NextFunction } from 'express';

export const corsMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // COMPLETAMENTE DESACTIVADO - Apache maneja TODO el CORS
  console.log('CORS middleware DESACTIVADO - Apache maneja CORS');
  
  // Solo manejar OPTIONS si Apache no lo maneja bien
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request for:', req.path);
    res.status(200).end();
    return;
  }

  // Siempre llamar next() para requests normales
  next();
};