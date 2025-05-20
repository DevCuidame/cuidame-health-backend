"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactRepository = void 0;
const base_repository_1 = require("../../core/repositories/base.repository");
const contact_model_1 = require("../../models/contact.model");
class ContactRepository extends base_repository_1.BaseRepository {
    constructor() {
        super(contact_model_1.Contact);
    }
    /**
     * Encuentra contactos por ID de usuario
     * @param userId ID del usuario
     * @returns Contactos del usuario o null si no existen
     */
    async findByUserId(userId) {
        return await this.repository.findOne({
            where: { id_usuario: userId },
        });
    }
    /**
     * Crea o actualiza los contactos de un usuario
     * @param userId ID del usuario
     * @param contactData Datos de los contactos
     * @returns Contacto creado o actualizado
     */
    async createOrUpdateContact(userId, contactData) {
        // Verificar si ya existen contactos para este usuario
        const existingContact = await this.findByUserId(userId);
        if (existingContact) {
            // Actualizar el registro existente
            const updatedContact = await this.update(existingContact.id, {
                ...contactData,
                updated_at: new Date()
            }, 'Contacto');
            return updatedContact;
        }
        else {
            // Crear un nuevo registro
            const newContact = await this.create({
                id_usuario: userId,
                ...contactData,
                created_at: new Date(),
                updated_at: new Date()
            });
            return newContact;
        }
    }
}
exports.ContactRepository = ContactRepository;
