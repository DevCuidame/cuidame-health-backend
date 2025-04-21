import { Request, Response, NextFunction } from 'express';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactDto } from './contact.dto';
import { ApiResponse } from '../../core/interfaces/response.interface';
import { BadRequestError } from '../../utils/error-handler';

export class ContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  /**
   * Obtener los contactos del usuario autenticado
   * @route GET /api/contacts
   */
  getMyContacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const contacts = await this.contactService.getContactsByUserId(userId);
      
      const response: ApiResponse = {
        success: true,
        data: contacts,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Crear o actualizar los contactos del usuario autenticado
   * @route POST /api/contacts
   */
  createOrUpdateContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const contactData: CreateContactDto = req.body;
      const contact = await this.contactService.createOrUpdateContact(userId, contactData);
      
      const response: ApiResponse = {
        success: true,
        message: 'Contactos guardados correctamente',
        data: contact,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Eliminar un contacto específico
   * @route DELETE /api/contacts/:contactNumber
   */
  deleteContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        throw new BadRequestError('Usuario no autenticado');
      }
      
      const contactNumber = parseInt(req.params.contactNumber);
      
      if (isNaN(contactNumber) || contactNumber < 1 || contactNumber > 3) {
        throw new BadRequestError('Número de contacto inválido. Debe ser 1, 2 o 3');
      }
      
      const updatedContact = await this.contactService.deleteSpecificContact(userId, contactNumber);
      
      const response: ApiResponse = {
        success: true,
        message: `Contacto #${contactNumber} eliminado correctamente`,
        data: updatedContact,
        timestamp: new Date().toISOString()
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}