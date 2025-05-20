
  // src/modules/chat/chat.routes.ts
  import { Router } from 'express';
  import { ChatController } from './chat.controller';
  
  const router = Router();
  const chatController = new ChatController();

  // Public routes
  router.post('/session', chatController.startSession);
  router.get('/session/:sessionId', chatController.getSession);
  router.post('/message', chatController.sendMessage);
  
  export default router;