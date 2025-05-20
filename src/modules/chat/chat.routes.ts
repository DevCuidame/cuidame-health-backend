
  // src/modules/chat/chat.routes.ts
  import { Router } from 'express';
  import { ChatController } from './chat.controller';
  
  const router = Router();
  const chatController = new ChatController();

console.log("Cargando rutas de citas del chat")


  // Public routes
  router.post('/session', chatController.startSession);
  router.get('/session/:sessionId', chatController.getSession);
  router.post('/message', chatController.sendMessage);

  router.get('/test', (req, res) => {
    res.json({ success: true, message: 'Chat routes are working!' });
  });
  
  export default router;