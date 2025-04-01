import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './environment';
import { errorMiddleware } from '../middlewares/error.middleware';
import path from 'path';

export const setupExpress = (): Application => {
  const app: Application = express();
  
  // Middleware básicos
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Seguridad
  app.use(helmet());
  
  // CORS
  app.use(cors());
  
  // Logging
  if (config.env === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }
  
  // Carpeta estática para archivos subidos
  app.use('/uploads', express.static(path.join(process.cwd(), config.fileUpload.path)));
  
  // Ruta de estado
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'API is running',
      timestamp: new Date(),
      environment: config.env
    });
  });
  
  // Middleware global para manejo de errores
  app.use(errorMiddleware);
  
  return app;
};