import { BaseRepository } from '../../core/repositories/base.repository';
import { Contact } from '../../models/contact.model';
import { AppDataSource } from '../../core/config/database';

export class ContactRepository extends BaseRepository<Contact> {
  constructor() {
    super(Contact);
  }

  /**
   * Encuentra contactos por ID de usuario
   * @param userId ID del usuario
   * @returns Contactos del usuario o null si no existen
   */
  async findByUserId(userId: number): Promise<Contact | null> {
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
  async createOrUpdateContact(userId: number, contactData: Partial<Contact>): Promise<Contact> {
    // Verificar si ya existen contactos para este usuario
    const existingContact = await this.findByUserId(userId);

    if (existingContact) {
      // Actualizar el registro existente
      const updatedContact = await this.update(
        existingContact.id,
        {
          ...contactData,
          updated_at: new Date()
        },
        'Contacto'
      );
      return updatedContact;
    } else {
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