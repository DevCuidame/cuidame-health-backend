"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTemplateService = void 0;
// src/modules/notification/services/notification-template.service.ts
const notification_template_repository_1 = require("../repositories/notification-template.repository");
const error_handler_1 = require("../../../utils/error-handler");
/**
 * Servicio para la gestión de plantillas de notificaciones
 */
class NotificationTemplateService {
    notificationTemplateRepository;
    constructor() {
        this.notificationTemplateRepository = new notification_template_repository_1.NotificationTemplateRepository();
    }
    /**
     * Obtiene todas las plantillas de notificación
     * @returns Lista de plantillas
     */
    async getAllTemplates() {
        return await this.notificationTemplateRepository.findAll({
            where: { is_active: true },
            order: { name: 'ASC' }
        });
    }
    /**
     * Obtiene una plantilla por ID
     * @param id ID de la plantilla
     * @returns Plantilla encontrada
     */
    async getTemplateById(id) {
        const template = await this.notificationTemplateRepository.findById(id);
        if (!template) {
            throw new error_handler_1.NotFoundError(`Plantilla con ID ${id} no encontrada`);
        }
        return template;
    }
    /**
     * Obtiene una plantilla por código único
     * @param code Código de la plantilla
     * @returns Plantilla encontrada
     */
    async getTemplateByCode(code) {
        const template = await this.notificationTemplateRepository.findByCode(code);
        if (!template) {
            throw new error_handler_1.NotFoundError(`Plantilla con código ${code} no encontrada`);
        }
        return template;
    }
    /**
     * Obtiene plantillas por tipo de notificación
     * @param type Tipo de notificación
     * @returns Lista de plantillas
     */
    async getTemplatesByType(type) {
        return await this.notificationTemplateRepository.findByType(type);
    }
    /**
     * Crea una nueva plantilla de notificación
     * @param data Datos de la plantilla
     * @returns Plantilla creada
     */
    async createTemplate(data) {
        // Verificar datos mínimos
        if (!data.name || !data.code || !data.type || !data.subject || !data.body_template) {
            throw new error_handler_1.BadRequestError('Faltan datos obligatorios para crear la plantilla');
        }
        // Verificar que no exista otra plantilla con el mismo código
        const existingTemplate = await this.notificationTemplateRepository.findByCode(data.code);
        if (existingTemplate) {
            throw new error_handler_1.BadRequestError(`Ya existe una plantilla con el código ${data.code}`);
        }
        // Extraer variables de la plantilla (formato {{variable}})
        const variableMatches = data.body_template.match(/{{([^}]+)}}/g);
        if (variableMatches) {
            // Eliminar duplicados y extraer los nombres de variables
            const variables = [...new Set(variableMatches)].map(match => match.replace(/{{|}}/g, ''));
            data.variables = variables;
        }
        else {
            data.variables = [];
        }
        return await this.notificationTemplateRepository.create(data);
    }
    /**
     * Actualiza una plantilla existente
     * @param id ID de la plantilla
     * @param data Datos a actualizar
     * @returns Plantilla actualizada
     */
    async updateTemplate(id, data) {
        // Verificar si existe la plantilla
        await this.getTemplateById(id);
        // Si se actualiza el código, verificar que no exista otro con ese código
        if (data.code) {
            const existingTemplate = await this.notificationTemplateRepository.findByCode(data.code);
            if (existingTemplate && existingTemplate.id !== id) {
                throw new error_handler_1.BadRequestError(`Ya existe una plantilla con el código ${data.code}`);
            }
        }
        // Si se actualiza el body_template, actualizar también las variables
        if (data.body_template) {
            const variableMatches = data.body_template.match(/{{([^}]+)}}/g);
            if (variableMatches) {
                // Eliminar duplicados y extraer los nombres de variables
                const variables = [...new Set(variableMatches)].map(match => match.replace(/{{|}}/g, ''));
                data.variables = variables;
            }
            else {
                data.variables = [];
            }
        }
        return await this.notificationTemplateRepository.update(id, data, 'Plantilla de notificación');
    }
    /**
     * Elimina (desactiva) una plantilla
     * @param id ID de la plantilla
     * @returns Mensaje de confirmación
     */
    async deleteTemplate(id) {
        // Verificar si existe la plantilla
        await this.getTemplateById(id);
        // Desactivar en lugar de eliminar
        await this.notificationTemplateRepository.update(id, { is_active: false }, 'Plantilla de notificación');
        return {
            success: true,
            message: 'Plantilla desactivada correctamente'
        };
    }
    /**
     * Renderiza una plantilla con datos
     * @param templateCode Código de la plantilla
     * @param data Datos para renderizar
     * @returns Objeto con asunto y cuerpo renderizado
     */
    async renderTemplate(templateCode, data) {
        // Obtener la plantilla
        const template = await this.getTemplateByCode(templateCode);
        // Renderizar el asunto
        let subject = template.subject;
        // Renderizar el cuerpo
        let body = template.body_template;
        // Reemplazar variables en asunto y cuerpo
        if (template.variables && template.variables.length > 0) {
            template.variables.forEach(variable => {
                const value = data[variable] !== undefined ? data[variable] : '';
                const regex = new RegExp(`{{${variable}}}`, 'g');
                subject = subject.replace(regex, value);
                body = body.replace(regex, value);
            });
        }
        return { subject, body };
    }
}
exports.NotificationTemplateService = NotificationTemplateService;
