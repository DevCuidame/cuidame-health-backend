"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const contact_repository_1 = require("./contact.repository");
const error_handler_1 = require("../../utils/error-handler");
class ContactService {
    contactRepository;
    constructor() {
        this.contactRepository = new contact_repository_1.ContactRepository();
    }
    /**
     * Obtener los contactos de un usuario
     * @param userId ID del usuario
     * @returns Contactos del usuario
     */
    async getContactsByUserId(userId) {
        return await this.contactRepository.findByUserId(userId);
    }
    /**
     * Crear o actualizar los contactos de un usuario
     * @param userId ID del usuario
     * @param contactData Datos de los contactos
     * @returns Contactos creados o actualizados
     */
    async createOrUpdateContact(userId, contactData) {
        // Validar que al menos un contacto tenga nombre y teléfono
        const hasValidContact = ((contactData.nombre1 && contactData.telefono1) ||
            (contactData.nombre2 && contactData.telefono2) ||
            (contactData.nombre3 && contactData.telefono3));
        if (!hasValidContact) {
            throw new error_handler_1.BadRequestError('Debe proporcionar al menos un contacto con nombre y teléfono');
        }
        // Validar campos de contacto (si se proporciona nombre, debe tener teléfono y viceversa)
        if ((contactData.nombre1 && !contactData.telefono1) || (!contactData.nombre1 && contactData.telefono1)) {
            throw new error_handler_1.BadRequestError('El primer contacto debe tener tanto nombre como teléfono');
        }
        if ((contactData.nombre2 && !contactData.telefono2) || (!contactData.nombre2 && contactData.telefono2)) {
            throw new error_handler_1.BadRequestError('El segundo contacto debe tener tanto nombre como teléfono');
        }
        if ((contactData.nombre3 && !contactData.telefono3) || (!contactData.nombre3 && contactData.telefono3)) {
            throw new error_handler_1.BadRequestError('El tercer contacto debe tener tanto nombre como teléfono');
        }
        return await this.contactRepository.createOrUpdateContact(userId, contactData);
    }
    /**
     * Eliminar un contacto específico (nombre y teléfono)
     * @param userId ID del usuario
     * @param contactNumber Número del contacto a eliminar (1, 2 o 3)
     * @returns Contacto actualizado
     */
    async deleteSpecificContact(userId, contactNumber) {
        // Buscar contactos del usuario
        const contacts = await this.contactRepository.findByUserId(userId);
        if (!contacts) {
            throw new error_handler_1.NotFoundError('No se encontraron contactos para este usuario');
        }
        // Eliminar el contacto específico
        const updateData = {};
        switch (contactNumber) {
            case 1:
                updateData.nombre1 = null;
                updateData.telefono1 = null;
                break;
            case 2:
                updateData.nombre2 = null;
                updateData.telefono2 = null;
                break;
            case 3:
                updateData.nombre3 = null;
                updateData.telefono3 = null;
                break;
            default:
                throw new error_handler_1.BadRequestError('Número de contacto inválido. Debe ser 1, 2 o 3');
        }
        // Verificar si quedaría al menos un contacto
        const contactsRemaining = (contactNumber !== 1 && contacts.nombre1 && contacts.telefono1) ||
            (contactNumber !== 2 && contacts.nombre2 && contacts.telefono2) ||
            (contactNumber !== 3 && contacts.nombre3 && contacts.telefono3);
        if (!contactsRemaining) {
            throw new error_handler_1.BadRequestError('Debe mantener al menos un contacto');
        }
        return await this.contactRepository.update(contacts.id, updateData, 'Contacto');
    }
}
exports.ContactService = ContactService;
