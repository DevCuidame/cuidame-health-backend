import app from './app';
import config from './core/config/environment';
import logger from './utils/logger';
import { ChatSocketService } from './modules/chat/websocket/chat-socket.service';
import http from 'http';
import { AppointmentSocketService } from './modules/appointment/websocket/appointment-socket.service';
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
  logger.debug(`🔄 Upgrade request for: ${request.url}`);
  // Dejar que los WebSocket.Server manejen la conexión
  if (request.url === '/ws/chat') {
    chatSocketService.getServer().handleUpgrade(request, socket, head, (ws) => {
      chatSocketService.getServer().emit('connection', ws, request);
    });
  } else if (request.url === '/ws/appointments') {
    appointmentSocketService.getServer().handleUpgrade(request, socket, head, (ws) => {
      appointmentSocketService.getServer().emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Iniciar servidor
server.listen(PORT, () => {
  logger.info(`🚀 Servidor ejecutándose en http://${HOST}:${PORT}`);
  logger.info(
    `📚 API disponible en http://${HOST}:${PORT}${config.server.apiPrefix}`
  );
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
