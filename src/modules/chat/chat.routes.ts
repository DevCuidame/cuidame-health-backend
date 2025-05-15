
  // src/modules/chat/chat.routes.ts
  import { Router } from 'express';
  import { ChatController } from './chat.controller';
  import { authMiddleware } from '../../middlewares/auth.middleware';
  
  const router = Router();
  const chatController = new ChatController();

  router.use(authMiddleware);
  
  // Public routes
  router.post('/session', chatController.startSession);
  router.get('/session/:sessionId', chatController.getSession);
  router.post('/message', chatController.sendMessage);
  
  // Protected routes (if needed)
  // Add protected routes here
  
  export default router;