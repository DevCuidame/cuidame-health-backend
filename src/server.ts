import app from './app';
import config from './core/config/environment';
import logger from './utils/logger';
import { ChatSocketService } from './modules/chat/websocket/chat-socket.service';
import http from 'http';
import { AppointmentSocketService } from './modules/appointment/websocket/appointment-socket.service';

// Establecer puerto
const PORT = config.server.port;
const HOST = config.server.host;

// Crear servidor HTTP
const server = http.createServer(app);

// IMPORTANTE: Inicializar WebSocket ANTES de que el servidor comience a escuchar
let chatSocketService: ChatSocketService;
let appointmentSocketService: AppointmentSocketService;

try {
  chatSocketService = new ChatSocketService(server);
  logger.info(`✅ WebSocket Chat service initialized`);

  appointmentSocketService = new AppointmentSocketService(server);
  logger.info('📅 Appointment WebSocket service initialized');
} catch (error) {
  logger.error(`❌ Error al inicializar el WebSocket: ${error}`);
  process.exit(1);
}

// Verificar que el WebSocket Server esté listo
server.on('upgrade', (request, socket, head) => {
  const url = request.url;
  logger.info(`🔄 WebSocket upgrade request received for: ${url}`);
  
  if (url === '/ws/chat') {
    logger.info(`✅ WebSocket upgrade approved for /ws/chat`);
    // El ChatSocketService maneja esto automáticamente
  } else if (url === '/ws/appointments') {
    logger.info(`✅ WebSocket upgrade approved for /ws/appointments`);
    // El AppointmentSocketService maneja esto automáticamente
  } else {
    logger.warn(`❌ WebSocket upgrade rejected for: ${url}`);
    socket.destroy();
  }
});

// Iniciar servidor
server.listen(PORT, () => {
  logger.info(`🚀 Servidor ejecutándose en http://${HOST}:${PORT}`);
  logger.info(`📚 API disponible en http://${HOST}:${PORT}${config.server.apiPrefix}`);
  logger.info(`📱 WebSocket Chat disponible en ws://${HOST}:${PORT}/ws/chat`);
  logger.info(`🌍 Entorno: ${config.env}`);
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
  server.close(() => {
    logger.info('Servidor HTTP cerrado');
    process.exit(0);
  });
  if (appointmentSocketService) {
    appointmentSocketService.closeAllConnections();
    logger.info('📅 Appointment WebSocket cerrado');
  }
  
  // Forzar cierre si tarda más de 10 segundos
  setTimeout(() => {
    logger.error('Cierre forzado después del tiempo de espera');
    process.exit(1);
  }, 10000);
};

export default server;