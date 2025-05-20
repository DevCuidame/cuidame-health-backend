"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_2 = require("./core/config/express");
const database_1 = require("./core/config/database");
const routes_1 = __importDefault(require("./routes"));
const environment_1 = __importDefault(require("./core/config/environment"));
const logger_1 = __importDefault(require("./utils/logger"));
const cors_middleware_1 = require("./middlewares/cors.middleware");
// Inicializar aplicación Express
const app = (0, express_1.default)();
app.use(cors_middleware_1.corsMiddleware);
// Then setup other Express configurations
(0, express_2.setupExpress)(app);
// Definir ruta de la API
app.use(environment_1.default.server.apiPrefix, routes_1.default);
// Ruta 404 para rutas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.originalUrl}`,
        timestamp: new Date().toISOString(),
    });
});
// Inicializar conexión a la base de datos
const initializeDatabase = async () => {
    try {
        await database_1.AppDataSource.initialize();
        logger_1.default.info('✅ Conexión a la base de datos establecida');
    }
    catch (error) {
        logger_1.default.error('❌ Error al conectar a la base de datos:', error);
        throw error;
    }
};
// Función para inicializar la aplicación
const initializeApp = async () => {
    try {
        await initializeDatabase();
        logger_1.default.info('✅ Aplicación inicializada correctamente');
    }
    catch (error) {
        logger_1.default.error('❌ Error al inicializar la aplicación:', error);
        process.exit(1);
    }
};
// Inicializar aplicación
initializeApp();
exports.default = app;
