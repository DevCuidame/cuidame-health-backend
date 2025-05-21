import express, { Request, Response, NextFunction } from 'express';
import { setupExpress } from './core/config/express';
import { AppDataSource } from './core/config/database';
import routes from './routes';
import config from './core/config/environment';
import logger from './utils/logger';
import { corsMiddleware } from './middlewares/cors.middleware';

// Inicializar aplicación Express
const app = express();

// IMPORTANTE: CORS debe ir PRIMERO
app.use(corsMiddleware);

// Luego configuraciones básicas de Express
setupExpress(app);

// Middleware de logging para debug
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`📥 ${req.method} ${req.url}`);
  next();
});

// Ruta de health check ANTES de las rutas principales
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date(),
    environment: config.env,
  });
});

// IMPORTANTE: Definir rutas de la API
logger.info(`🔧 Mounting routes on: ${config.server.apiPrefix}`);
app.use(config.server.apiPrefix, routes);

// Middleware de debug para ver qué rutas están registradas
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.warn(`🔍 Route not found: ${req.method} ${req.originalUrl}`);
  next();
});



app.get('/ws/chat', (req: Request, res: Response) => {
  logger.info('🔍 HTTP GET request to WebSocket endpoint');
  logger.info('Headers:', req.headers);
  
  // Check if it's a WebSocket upgrade request
  const isWebSocketUpgrade = req.headers.upgrade === 'websocket' && 
                             req.headers.connection?.toLowerCase().includes('upgrade');
  
  if (isWebSocketUpgrade) {
    logger.warn('⚠️ WebSocket upgrade request received as HTTP - Apache proxy issue');
  }
  
  res.status(426).json({
    error: 'Upgrade Required',
    message: 'This endpoint requires WebSocket connection',
    receivedHeaders: {
      upgrade: req.headers.upgrade,
      connection: req.headers.connection,
      'sec-websocket-key': req.headers['sec-websocket-key'],
      'sec-websocket-version': req.headers['sec-websocket-version']
    },
    instructions: {
      correct: 'Use WebSocket client to connect to wss://health-api.cuidame.tech/ws/chat',
      problem: 'Apache is not correctly upgrading WebSocket connections',
      solution: 'Check Apache proxy configuration for WebSocket upgrade handling'
    }
  });
});



// Ruta 404 para rutas no encontradas (DEBE IR AL FINAL)
app.use('*', (req: Request, res: Response) => {
  logger.error(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
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
    
    // Debug: Mostrar rutas registradas
    app._router.stack.forEach((middleware: any) => {
      if (middleware.route) {
        logger.info(`📍 Route: ${middleware.route.path}`);
      } else if (middleware.name === 'router') {
        middleware.handle.stack.forEach((handler: any) => {
          if (handler.route) {
            logger.info(`📍 Nested Route: ${handler.route.path}`);
          }
        });
      }
    });
    
    logger.info('✅ Aplicación inicializada correctamente');
  } catch (error) {
    logger.error('❌ Error al inicializar la aplicación:', error);
    process.exit(1);
  }
};

// Inicializar aplicación
initializeApp();

export default app;