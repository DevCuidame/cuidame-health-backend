"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const environment_1 = __importDefault(require("./core/config/environment"));
const logger_1 = __importDefault(require("./utils/logger"));
const chat_socket_service_1 = require("./modules/chat/websocket/chat-socket.service");
const http_1 = __importDefault(require("http"));
const appointment_socket_service_1 = require("./modules/appointment/websocket/appointment-socket.service");
// import expressWs from 'express-ws';
// Establecer puerto
const PORT = environment_1.default.server.port;
const HOST = environment_1.default.server.host;
// Crear servidor HTTP
const server = http_1.default.createServer(app_1.default);
// expressWs(app, server);
let chatSocketService;
let appointmentSocketService;
try {
    chatSocketService = new chat_socket_service_1.ChatSocketService(server);
    appointmentSocketService = new appointment_socket_service_1.AppointmentSocketService(server);
    logger_1.default.info('All WebSocket services initialized');
}
catch (error) {
    logger_1.default.error(`WebSocket init error: ${error}`);
    process.exit(1);
}
server.on('upgrade', (request, socket, head) => {
    const pathname = request.url || '';
    logger_1.default.debug(`🔄 Upgrade request for: ${pathname}`);
    if (pathname === '/ws/chat') {
        chatSocketService.getServer().handleUpgrade(request, socket, head, (ws) => {
            chatSocketService.getServer().emit('connection', ws, request);
        });
    }
    else if (pathname === '/ws/appointments') {
        appointmentSocketService.getServer().handleUpgrade(request, socket, head, (ws) => {
            appointmentSocketService.getServer().emit('connection', ws, request);
        });
    }
    else {
        logger_1.default.warn(`❌ Unknown WebSocket path: ${pathname}`);
        socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
        socket.destroy();
    }
});
// Iniciar servidor
server.listen(PORT, () => {
    logger_1.default.info(`🚀 Servidor ejecutándose en http://${HOST}:${PORT}`);
    logger_1.default.info(`📚 API disponible en http://${HOST}:${PORT}${environment_1.default.server.apiPrefix}`);
    logger_1.default.info(`📱 WebSocket Chat disponible en ws://${HOST}:${PORT}/ws/chat`);
    logger_1.default.info(`🌍 Entorno: ${environment_1.default.env}`);
});
// Manejar errores del servidor
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        logger_1.default.error(`❌ Puerto ${PORT} ya está en uso`);
    }
    else {
        logger_1.default.error(`❌ Error del servidor: ${error}`);
    }
    process.exit(1);
});
// Manejar señales de terminación
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM recibido. Cerrando servidor HTTP');
    shutdown();
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT recibido. Cerrando servidor HTTP');
    shutdown();
});
// Función para cerrar graciosamente
const shutdown = () => {
    server.close(() => {
        logger_1.default.info('Servidor HTTP cerrado');
        process.exit(0);
    });
    // Forzar cierre si tarda más de 10 segundos
    setTimeout(() => {
        logger_1.default.error('Cierre forzado después del tiempo de espera');
        process.exit(1);
    }, 10000);
};
exports.default = server;
