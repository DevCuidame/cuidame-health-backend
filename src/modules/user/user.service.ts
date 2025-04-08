import { BadRequestError, NotFoundError, UnauthorizedError } from "../../utils/error-handler";
import { User } from "./user.model";
import { UserRepository } from "./user.repository";
import { PaginatedResult, PaginationParams } from "src/core/interfaces/response.interface";
import { UserFilterOptions } from "./user.interface";
import { PasswordService } from "../../utils/password.util";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Obtener un usuario por ID
   * @param userId ID del usuario
   * @returns Usuario encontrado
   */
  async getUserById(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${userId} no encontrado`);
    }
    return user;
  }

  /**
   * Obtener usuarios con paginación
   * @param params Parámetros de paginación
   * @returns Resultado paginado de usuarios
   */
  async getUsers(params: PaginationParams): Promise<PaginatedResult<User>> {
    return await this.userRepository.findWithPagination(params, {
      relations: ['userRoles', 'userRoles.role']
    });
  }

  /**
   * Buscar usuarios por filtros
   * @param filters Filtros de búsqueda
   * @returns Lista de usuarios que coinciden con los filtros
   */
  async searchUsers(filters: UserFilterOptions): Promise<User[]> {
    return await this.userRepository.findByFilters(filters);
  }

  /**
   * Actualizar datos de un usuario
   * @param userId ID del usuario
   * @param userData Datos a actualizar
   * @returns Usuario actualizado
   */
  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    // Comprobar si el usuario existe
    await this.getUserById(userId);
    
    // Si se intenta actualizar el email, verificar que no exista otro usuario con ese email
    if (userData.email) {
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestError('El correo electrónico ya está en uso por otro usuario');
      }
    }
    
    // Actualizar usuario
    return await this.userRepository.update(userId, userData, 'Usuario');
  }

  /**
   * Cambiar contraseña de un usuario
   * @param userId ID del usuario
   * @param currentPassword Contraseña actual
   * @param newPassword Nueva contraseña
   * @returns Usuario actualizado
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<User> {
    // Buscar usuario incluyendo la contraseña
    const user = await this.userRepository.findByEmail(
      (await this.getUserById(userId)).email,
      true
    );
    
    if (!user || !user.password) {
      throw new NotFoundError('Usuario no encontrado o sin contraseña configurada');
    }
    
    // Verificar contraseña actual usando el sistema híbrido
    const isPasswordValid = PasswordService.verifyPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Contraseña actual incorrecta');
    }
    
    // Generar hash de la nueva contraseña usando el método seguro
    const hashedPassword = PasswordService.hashPassword(newPassword);
    
    // Actualizar contraseña
    return await this.userRepository.update(userId, {
      password: hashedPassword,
      updated_at: new Date()
    }, 'Usuario');
  }

  /**
   * Actualizar avatar/imagen de perfil del usuario
   * @param userId ID del usuario
   * @param imageData Datos de la imagen (base64)
   * @param fileName Nombre del archivo
   * @returns Usuario actualizado
   */
  async updateProfileImage(userId: number, imageData: string, fileName: string): Promise<User> {
    // Comprobar si el usuario existe
    await this.getUserById(userId);
    
    // Actualizar imagen
    return await this.userRepository.update(userId, {
      imagebs64: imageData,
      pubname: fileName,
      updated_at: new Date()
    }, 'Usuario');
  }

  /**
   * Asignar un rol a un usuario
   * @param userId ID del usuario
   * @param roleId ID del rol
   * @returns Confirmación de asignación
   */
  async assignRole(userId: number, roleId: number): Promise<{ success: boolean, message: string }> {
    // Comprobar si el usuario existe
    await this.getUserById(userId);
    
    // Asignar rol
    await this.userRepository.assignRole(userId, roleId);
    
    return {
      success: true,
      message: 'Rol asignado correctamente'
    };
  }

  /**
   * Quitar un rol a un usuario
   * @param userId ID del usuario
   * @param roleId ID del rol
   * @returns Confirmación de eliminación
   */
  async removeRole(userId: number, roleId: number): Promise<{ success: boolean, message: string }> {
    // Comprobar si el usuario existe
    await this.getUserById(userId);
    
    // Eliminar rol
    const result = await this.userRepository.removeRole(userId, roleId);
    
    if (!result) {
      throw new NotFoundError('Rol no encontrado para este usuario');
    }
    
    return {
      success: true,
      message: 'Rol eliminado correctamente'
    };
  }
}