// src/core/config/express.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './environment';
import { errorMiddleware } from '../../middlewares/error.middleware';
import path from 'path';
// src/core/config/express.ts - REMOVER todas las líneas de CORS

export const setupExpress = (existingApp?: Application): Application => {
  const app: Application = existingApp || express();
  // Middleware básicos
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Seguridad
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    })
  );

  // Logging
  if (config.env === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Carpeta estática para archivos subidos - SIN CORS
  app.use('/uploads', express.static('/home/developer/uploads'));

  // Carpeta estática - SIN HEADERS CORS
  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), config.fileUpload.path))
  );

  // Ruta de estado
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'API is running',
      timestamp: new Date(),
      environment: config.env,
    });
  });

  // Middleware global para manejo de errores debe ser el último
  app.use(errorMiddleware);

  return app;
};