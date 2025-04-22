// src/core/config/express.ts
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './environment';
import { errorMiddleware } from '../../middlewares/error.middleware';
import { corsMiddleware } from '../../middlewares/cors.middleware';
import path from 'path';

export const setupExpress = (): Application => {
  const app: Application = express();

  // Middleware básicos
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Seguridad - Modificar Helmet para permitir imágenes
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }, 
      contentSecurityPolicy: false 
    })
  );

  // Apply custom CORS middleware first (before routes)
  app.use(corsMiddleware);

  // Standard CORS middleware as a fallback
  const corsOptions = {
    origin: ['http://localhost:8100', 'http://localhost:4200', 'https://health.cuidame.tech'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };
  app.use(cors(corsOptions));
  
  // Handle OPTIONS requests explicitly
  app.options('*', cors(corsOptions));

  // Logging
  if (config.env === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Static folder for uploads with CORS headers
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });

  // Carpeta estática para archivos subidos
  app.use(
    '/uploads',
    express.static(path.join(process.cwd(), config.fileUpload.path), {
      setHeaders: (res) => {
        // Agregar encabezados adicionales específicos para archivos estáticos
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      }
    })
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