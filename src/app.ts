import express, { Request, Response, NextFunction } from 'express';
import { setupExpress } from './config/express';
import { AppDataSource } from './config/database';
import routes from './routes';
import config from './config/environment';
import logger from './utils/logger';

// Inicializar aplicación Express
const app = setupExpress();

// Definir ruta de la API
app.use(config.server.apiPrefix, routes);

// Ruta 404 para rutas no encontradas
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Inicializar conexión a la base de datos
const initializeDatabase = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    logger.info('✅ Conexión a la base de datos establecida');
  } catch (error) {
    logger.error('❌ Error al conectar a la base de datos:', error);
    throw error;
  }
};

// Función para inicializar la aplicación
const initializeApp = async (): Promise<void> => {
  try {
    await initializeDatabase();
    
    logger.info('✅ Aplicación inicializada correctamente');
  } catch (error) {
    logger.error('❌ Error al inicializar la aplicación:', error);
    process.exit(1);
  }
};

// Inicializar aplicación
initializeApp();

export default app;