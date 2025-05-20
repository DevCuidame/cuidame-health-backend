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
// Agregar esto a src/modules/chat/chat.routes.ts

// Test route para verificar WebSocket
router.get('/websocket/status', (req, res) => {
  try {
    logger.info('🧪 WebSocket status endpoint accessed');
    
    const response = {
      success: true,
      message: 'WebSocket status endpoint',
      data: {
        websocketUrl: `ws://${req.get('host')}/ws/chat`,
        httpsWebsocketUrl: `wss://${req.get('host')}/ws/chat`,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        availableEndpoints: [
          'ws://localhost:4000/ws/chat (development)',
          'wss://health-api.cuidame.tech/ws/chat (production)'
        ],
        instructions: {
          postman: 'Use WebSocket connection to ws://localhost:3000/ws/chat',
          angular: 'Connect to wss://health-api.cuidame.tech/ws/chat in production',
          testMessage: {
            type: 'init',
            sessionId: null
          }
        }
      },
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(response);
  } catch (error) {
    logger.error('❌ Error in WebSocket status endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking WebSocket status',
      error: error
    });
  }
});

export default router;