import express, { Request, Response, NextFunction } from 'express';
import { setupExpress } from './core/config/express';
import { AppDataSource } from './core/config/database';
import routes from './routes';
import config from './core/config/environment';
import logger from './utils/logger';
import { corsMiddleware } from './middlewares/cors.middleware';

// Inicializar aplicación Express
const app = express();

// Explicitly handle OPTIONS requests at the application level
app.options('*', (req, res) => {
  // Get the origin from the request
  const origin = req.headers.origin;
  
  // Define allowed origins
  const allowedOrigins = [
    'http://localhost:8100', 
    'http://localhost:4200', 
    'https://health.cuidame.tech'
  ];
  
  // Set the proper origin based on the request
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (config.env === 'development') {
    // In development mode, use wildcard if the origin is not in our list
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  // Other CORS headers
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

// Apply CORS middleware first, before anything else
app.use(corsMiddleware);

// Then setup other Express configurations
const configuredApp = setupExpress(app);

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