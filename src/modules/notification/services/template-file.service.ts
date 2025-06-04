// src/modules/notification/services/template-file.service.ts
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import logger from '../../../utils/logger';

// Convertir fs.readFile a promesa
const readFileAsync = promisify(fs.readFile);

/**
 * Servicio para manejar plantillas de correo electrónico desde archivos
 */
export class TemplateFileService {
  private templatesDir: string;

  constructor() {
    // Directorio base de plantillas
    this.templatesDir = path.join(process.cwd(), 'src', 'templates');
  }

  /**
   * Obtiene una plantilla desde un archivo
   * @param templateName Nombre del archivo de plantilla (sin extensión)
   * @returns Contenido de la plantilla
   */
  async getTemplate(templateName: string): Promise<string> {
    try {
      // Construir ruta completa al archivo de plantilla
      const templatePath = path.join(this.templatesDir, `${templateName}.html`);
      
      // Verificar si el archivo existe
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Plantilla ${templateName} no encontrada en ${templatePath}`);
      }
      
      // Leer el archivo
      const templateContent = await readFileAsync(templatePath, 'utf8');
      return templateContent;
    } catch (error) {
      logger.error(`Error al leer plantilla ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Renderiza una plantilla con datos
   * @param templateName Nombre del archivo de plantilla (sin extensión)
   * @param data Datos para renderizar la plantilla
   * @returns Plantilla renderizada
   */
  async renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    try {
      // Obtener la plantilla
      const template = await this.getTemplate(templateName);
      
      // Renderizar la plantilla reemplazando variables
      let rendered = template;
      
      // Buscar todas las variables en la plantilla (formato {{variable}})
      const variableMatches = template.match(/{{([^}]+)}}/g);
      
      if (variableMatches) {
        // Eliminar duplicados
        const uniqueVariables = [...new Set(variableMatches)];
        
        // Reemplazar cada variable por su valor
        uniqueVariables.forEach(match => {
          const variableName = match.replace(/{{|}}/g, '');
          const value = data[variableName] !== undefined ? data[variableName] : '';
          rendered = rendered.replace(new RegExp(match, 'g'), value);
        });
      }
      
      return rendered;
    } catch (error) {
      logger.error(`Error al renderizar plantilla ${templateName}:`, error);
      throw error;
    }
  }
}