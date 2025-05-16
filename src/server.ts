import app from './app';
import config from './core/config/environment';
import logger from './utils/logger';
import { ChatSocketService } from './modules/chat/websocket/chat-socket.service';
import http from 'http';

// Establecer puerto
const PORT = config.server.port;
const HOST = config.server.host;

const server = http.createServer(app);

// Iniciar servidor
server.listen(PORT, () => {
  logger.info(`🚀 Servidor ejecutándose en http://${HOST}:${PORT}`);
  logger.info(`📚 API disponible en http://${HOST}:${PORT}${config.server.apiPrefix}`);
  logger.info(`🌍 Entorno: ${config.env}`);
});


// Inicializar servicio de WebSocket y mostrar información
try {
  const chatSocketService = new ChatSocketService(server);
  console.log("🚀 ~ chatSocketService:", chatSocketService)
  logger.info(`📱 WebSocket Chat disponible en ws://${HOST}:${PORT}/ws/chat`);
} catch (error) {
  logger.error(`❌ Error al inicializar el WebSocket: ${error}`);
}

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