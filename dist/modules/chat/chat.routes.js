"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/modules/chat/chat.routes.ts
const express_1 = require("express");
const chat_controller_1 = require("./chat.controller");
const logger_1 = __importDefault(require("../../utils/logger"));
const router = (0, express_1.Router)();
const chatController = new chat_controller_1.ChatController();
logger_1.default.info('🔧 Configurando rutas de chat...');
// Test route - DEBE IR PRIMERO para evitar conflictos con :sessionId
router.get('/test', chatController.test);
// Public routes
router.post('/session', chatController.startSession);
router.get('/session/:sessionId', chatController.getSession);
router.post('/message', chatController.sendMessage);
// Debug middleware para verificar que las rutas estén cargadas
router.use((req, res, next) => {
    logger_1.default.warn(`🔍 Chat route not matched: ${req.method} ${req.originalUrl}`);
    res.status(404).json({
        success: false,
        message: `Chat route not found: ${req.method} ${req.originalUrl}`,
        availableRoutes: [
            'GET /test',
            'POST /session',
            'GET /session/:sessionId',
            'POST /message'
        ]
    });
});
logger_1.default.info('✅ Rutas de chat configuradas');
exports.default = router;
