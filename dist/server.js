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
// Establecer puerto
const PORT = environment_1.default.server.port;
const HOST = environment_1.default.server.host;
const server = http_1.default.createServer(app_1.default);
// Iniciar servidor
server.listen(PORT, () => {
    logger_1.default.info(`🚀 Servidor ejecutándose en http://${HOST}:${PORT}`);
    logger_1.default.info(`📚 API disponible en http://${HOST}:${PORT}${environment_1.default.server.apiPrefix}`);
    logger_1.default.info(`🌍 Entorno: ${environment_1.default.env}`);
});
// Inicializar servicio de WebSocket y mostrar información
try {
    const chatSocketService = new chat_socket_service_1.ChatSocketService(server);
    logger_1.default.info(`📱 WebSocket Chat disponible en ws://${HOST}:${PORT}/ws/chat`);
}
catch (error) {
    logger_1.default.error(`❌ Error al inicializar el WebSocket: ${error}`);
}
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
