import app from './app';
import config from './core/config/environment';
import logger from './utils/logger';
import { ChatSocketService } from './modules/chat/websocket/chat-socket.service';
import http from 'http';
import { AppointmentSocketService } from './modules/appointment/websocket/appointment-socket.service';
import { initializeSessionCleanup, stopSessionCleanup } from './utils/session-cleanup.service';
import { AppDataSource } from './core/config/database';
// import expressWs from 'express-ws';
// Establecer puerto
const PORT = config.server.port;
const HOST = config.server.host;

// Crear servidor HTTP
const server = http.createServer(app);
// expressWs(app, server);


let chatSocketService: ChatSocketService;
let appointmentSocketService: AppointmentSocketService;

try {
  chatSocketService = new ChatSocketService(server);
  appointmentSocketService = new AppointmentSocketService(server);
  logger.info('All WebSocket services initialized');
} catch (error) {
  logger.error(`WebSocket init error: ${error}`);
  process.exit(1);
}

server.on('upgrade', (request, socket, head) => {
  const pathname = request.url || '';
  logger.debug(`🔄 Upgrade request for: ${pathname}`);
  
  if (pathname === '/ws/chat') {
    chatSocketService.getServer().handleUpgrade(request, socket, head, (ws) => {
      chatSocketService.getServer().emit('connection', ws, request);
    });
  } else if (pathname === '/ws/appointments') {
    appointmentSocketService.getServer().handleUpgrade(request, socket, head, (ws) => {
      appointmentSocketService.getServer().emit('connection', ws, request);
    });
  } else {
    logger.warn(`❌ Unknown WebSocket path: ${pathname}`);
    socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
    socket.destroy();
  }
});

// Función para inicializar servicios después de que la base de datos esté lista
const initializeServices = async () => {
  // Esperar a que la base de datos esté inicializada
  let retries = 0;
  const maxRetries = 30; // 30 segundos máximo
  
  while (!AppDataSource.isInitialized && retries < maxRetries) {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo
    retries++;
  }
  
  if (!AppDataSource.isInitialized) {
    logger.error('❌ Base de datos no inicializada después de 30 segundos');
    return;
  }
  
  // Inicializar servicio de limpieza automática de sesiones
  try {
    initializeSessionCleanup(24); // Ejecutar cada 24 horas
    logger.info('🧹 Servicio de limpieza automática de sesiones iniciado');
  } catch (error) {
    logger.error('❌ Error al inicializar servicio de limpieza de sesiones:', error);
  }
};

// Iniciar servidor
server.listen(PORT, () => {
  logger.info(`🚀 Servidor ejecutándose en http://${HOST}:${PORT}`);
  logger.info(
    `📚 API disponible en http://${HOST}:${PORT}${config.server.apiPrefix}`
  );
  logger.info(`📱 WebSocket Chat disponible en ws://${HOST}:${PORT}/ws/chat`);
  logger.info(`🌍 Entorno: ${config.env}`);
  
  // Inicializar servicios de forma asíncrona
  initializeServices();
});

// Manejar errores del servidor
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`❌ Puerto ${PORT} ya está en uso`);
  } else {
    logger.error(`❌ Error del servidor: ${error}`);
  }
  process.exit(1);
});

// Manejar señales de terminación
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido. Cerrando servidor HTTP');
  shutdown();
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido. Cerrando servidor HTTP');
  shutdown();
});

// Función para cerrar graciosamente
const shutdown = () => {
  logger.info('Iniciando cierre gracioso del servidor...');
  
  // Detener servicio de limpieza de sesiones
  try {
    stopSessionCleanup();
    logger.info('🧹 Servicio de limpieza de sesiones detenido');
  } catch (error) {
    logger.error('❌ Error al detener servicio de limpieza:', error);
  }
  
  server.close(() => {
    logger.info('Servidor HTTP cerrado');
    process.exit(0);
  });

  // Forzar cierre si tarda más de 10 segundos
  setTimeout(() => {
    logger.error('Cierre forzado después del tiempo de espera');
    process.exit(1);
  }, 10000);
};

export default server;
