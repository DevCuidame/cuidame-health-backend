"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const contact_service_1 = require("./contact.service");
const error_handler_1 = require("../../utils/error-handler");
class ContactController {
    contactService;
    constructor() {
        this.contactService = new contact_service_1.ContactService();
    }
    /**
     * Obtener los contactos del usuario autenticado
     * @route GET /api/contacts
     */
    getMyContacts = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const contacts = await this.contactService.getContactsByUserId(userId);
            const response = {
                success: true,
                data: contacts,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Crear o actualizar los contactos del usuario autenticado
     * @route POST /api/contacts
     */
    createOrUpdateContact = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const contactData = req.body;
            const contact = await this.contactService.createOrUpdateContact(userId, contactData);
            const response = {
                success: true,
                message: 'Contactos guardados correctamente',
                data: contact,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
    /**
     * Eliminar un contacto específico
     * @route DELETE /api/contacts/:contactNumber
     */
    deleteContact = async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new error_handler_1.BadRequestError('Usuario no autenticado');
            }
            const contactNumber = parseInt(req.params.contactNumber);
            if (isNaN(contactNumber) || contactNumber < 1 || contactNumber > 3) {
                throw new error_handler_1.BadRequestError('Número de contacto inválido. Debe ser 1, 2 o 3');
            }
            const updatedContact = await this.contactService.deleteSpecificContact(userId, contactNumber);
            const response = {
                success: true,
                message: `Contacto #${contactNumber} eliminado correctamente`,
                data: updatedContact,
                timestamp: new Date().toISOString()
            };
            res.status(200).json(response);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ContactController = ContactController;
