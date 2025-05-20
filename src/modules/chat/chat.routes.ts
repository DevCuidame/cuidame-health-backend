// src/modules/chat/chat.routes.ts
import { Router } from 'express';
import { ChatController } from './chat.controller';
import logger from '../../utils/logger';

const router = Router();
const chatController = new ChatController();

logger.info('🔧 Configurando rutas de chat...');

// Test route - DEBE IR PRIMERO para evitar conflictos con :sessionId
router.get('/test', chatController.test);

// Public routes
router.post('/session', chatController.startSession);
router.get('/session/:sessionId', chatController.getSession);
router.post('/message', chatController.sendMessage);

// Debug middleware para verificar que las rutas estén cargadas
router.use((req, res, next) => {
  logger.warn(`🔍 Chat route not matched: ${req.method} ${req.originalUrl}`);
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

logger.info('✅ Rutas de chat configuradas');

export default router;