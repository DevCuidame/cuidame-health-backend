import app from './app';
import config from './core/config/environment';
import logger from './utils/logger';
import { ChatSocketService } from './modules/chat/websocket/chat-socket.service';
import http from 'http';

// Establecer puerto
const PORT = config.server.port;
const HOST = config.server.host;

// Crear servidor HTTP
const server = http.createServer(app);

// IMPORTANTE: Inicializar WebSocket ANTES de que el servidor comience a escuchar
let chatSocketService: ChatSocketService;

try {
  chatSocketService = new ChatSocketService(server);
  logger.info(`✅ WebSocket Chat service initialized`);
} catch (error) {
  logger.error(`❌ Error al inicializar el WebSocket: ${error}`);
  process.exit(1);
}

// Verificar que el WebSocket Server esté listo
server.on('upgrade', (request, socket, head) => {
  logger.info(`🔄 WebSocket upgrade request received for: ${request.url}`);
  
  if (request.url === '/ws/chat') {
    logger.info(`✅ WebSocket upgrade approved for /ws/chat`);
    // El WebSocket Server debe manejar esto automáticamente
  } else {
    logger.warn(`❌ WebSocket upgrade rejected for: ${request.url}`);
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
  
  // Forzar cierre si tarda más de 10 segundos
  setTimeout(() => {
    logger.error('Cierre forzado después del tiempo de espera');
    process.exit(1);
  }, 10000);
};

export default server;