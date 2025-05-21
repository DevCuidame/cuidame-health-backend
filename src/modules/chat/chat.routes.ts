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


export default router;