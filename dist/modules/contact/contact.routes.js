"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_controller_1 = require("./contact.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const validator_middleware_1 = require("../../middlewares/validator.middleware");
const contact_dto_1 = require("./contact.dto");
const router = (0, express_1.Router)();
const contactController = new contact_controller_1.ContactController();
/**
 * Rutas que requieren autenticación
 */
router.use(auth_middleware_1.authMiddleware);
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
router.post('/', (0, validator_middleware_1.validateDto)(contact_dto_1.CreateContactDto), contactController.createOrUpdateContact);
/**
 * @route DELETE /api/contacts/:contactNumber
 * @desc Eliminar un contacto específico (1, 2 o 3)
 * @access Private
 */
router.delete('/:contactNumber', contactController.deleteContact);
exports.default = router;
