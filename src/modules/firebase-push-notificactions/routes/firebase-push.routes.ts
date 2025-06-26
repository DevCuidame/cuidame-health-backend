import { Router } from 'express';
import { FirebasePushController } from '../controllers/firebase-push.controller';
import { authMiddleware } from '../../../middlewares/auth.middleware';

const router = Router();
const firebasePushController = new FirebasePushController();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// === RUTAS BÁSICAS ===
// Registrar token de dispositivo
router.post('/register-token', firebasePushController.registerToken);

// Desregistrar token de dispositivo
router.post('/unregister-token', firebasePushController.unregisterToken);

// Enviar notificación de prueba
router.post('/test', firebasePushController.sendTestNotification);

// === RUTAS OPTIMIZADAS PARA ANGULAR/IONIC ===
// Registrar token con información extendida
router.post('/register-enhanced', firebasePushController.registerTokenEnhanced);

// Enviar notificación masiva optimizada
router.post('/bulk-enhanced', firebasePushController.sendBulkNotificationEnhanced);

// Suscribir a topics
router.post('/subscribe-topic', firebasePushController.subscribeToTopicEnhanced);

// Obtener estadísticas de notificaciones
router.get('/stats', firebasePushController.getNotificationStats);

export default router;