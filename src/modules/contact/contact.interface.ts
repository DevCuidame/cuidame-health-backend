/**
 * Interfaz para representar un contacto
 */
export interface IContact {
    id?: number;
    id_usuario: number;
    nombre1?: string;
    telefono1?: string;
    nombre2?: string;
    telefono2?: string;
    nombre3?: string;
    telefono3?: string;
    created_at?: Date;
    updated_at?: Date;
  }
  
  /**
   * Interfaz para la respuesta de contacto
   */
  export interface IContactResponse {
    success: boolean;
    message: string;
    data?: IContact;
  }