import { Router } from 'express';
import { ContactController } from './contact.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { validateDto } from '../../middlewares/validator.middleware';
import { CreateContactDto, UpdateContactDto } from './contact.dto';

const router = Router();
const contactController = new ContactController();

/**
 * Rutas que requieren autenticación
 */
router.use(authMiddleware);

/**
 * @route GET /api/contacts
 * @desc Obtener contactos del usuario actual
 * @access Private
 */
router.get('/', contactController.getMyContacts);

/**
 * @route POST /api/contacts
 * @desc Crear o actualizar contactos del usuario actual
 * @access Private
 */
router.post('/', validateDto(CreateContactDto), contactController.createOrUpdateContact);

/**
 * @route DELETE /api/contacts/:contactNumber
 * @desc Eliminar un contacto específico (1, 2 o 3)
 * @access Private 
 */
router.delete('/:contactNumber', contactController.deleteContact);

export default router;