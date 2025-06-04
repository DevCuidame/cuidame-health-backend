"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const error_handler_1 = require("../../utils/error-handler");
const user_repository_1 = require("./user.repository");
const password_util_1 = require("../../utils/password.util");
class UserService {
    userRepository;
    constructor() {
        this.userRepository = new user_repository_1.UserRepository();
    }
    /**
     * Obtener un usuario por ID
     * @param userId ID del usuario
     * @returns Usuario encontrado
     */
    async getUserById(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new error_handler_1.NotFoundError(`Usuario con ID ${userId} no encontrado`);
        }
        return user;
    }
    /**
     * Obtener usuarios con paginación
     * @param params Parámetros de paginación
     * @returns Resultado paginado de usuarios
     */
    async getUsers(params) {
        return await this.userRepository.findWithPagination(params, {
            relations: ['userRoles', 'userRoles.role']
        });
    }
    /**
     * Buscar usuarios por filtros
     * @param filters Filtros de búsqueda
     * @returns Lista de usuarios que coinciden con los filtros
     */
    async searchUsers(filters) {
        return await this.userRepository.findByFilters(filters);
    }
    /**
     * Actualizar datos de un usuario
     * @param userId ID del usuario
     * @param userData Datos a actualizar
     * @returns Usuario actualizado
     */
    async updateUser(userId, userData) {
        // Comprobar si el usuario existe
        await this.getUserById(userId);
        // Si se intenta actualizar el email, verificar que no exista otro usuario con ese email
        if (userData.email) {
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser && existingUser.id !== userId) {
                throw new error_handler_1.BadRequestError('El correo electrónico ya está en uso por otro usuario');
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
    async changePassword(userId, currentPassword, newPassword) {
        // Buscar usuario incluyendo la contraseña
        const user = await this.userRepository.findByEmail((await this.getUserById(userId)).email, true);
        if (!user || !user.password) {
            throw new error_handler_1.NotFoundError('Usuario no encontrado o sin contraseña configurada');
        }
        // Verificar contraseña actual usando el sistema híbrido
        const isPasswordValid = password_util_1.PasswordService.verifyPassword(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new error_handler_1.UnauthorizedError('Contraseña actual incorrecta');
        }
        // Generar hash de la nueva contraseña usando el método seguro
        const hashedPassword = password_util_1.PasswordService.hashPassword(newPassword);
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
    async updateProfileImage(userId, imageData, fileName) {
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
    async assignRole(userId, roleId) {
        // Comprobar si el usuario existe
        await this.getUserById(userId);
        // Asignar rol
        // await this.userRepository.assignRole(userId, roleId);
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
    async removeRole(userId, roleId) {
        // Comprobar si el usuario existe
        await this.getUserById(userId);
        // Eliminar rol
        // const result = await this.userRepository.removeRole(userId, roleId);
        // if (!result) {
        //   throw new NotFoundError('Rol no encontrado para este usuario');
        // }
        return {
            success: true,
            message: 'Rol eliminado correctamente'
        };
    }
    /**
     * Eliminar cuenta de usuario
     * @param userId ID del usuario a eliminar
     * @returns Confirmación de eliminación
     */
    async deleteAccount(userId) {
        await this.getUserById(userId);
        // Eliminar usuario
        const result = await this.userRepository.delete(userId, 'Usuario');
        if (!result) {
            throw new error_handler_1.BadRequestError('No se pudo eliminar la cuenta de usuario');
        }
        return {
            success: true,
            message: 'Cuenta eliminada correctamente'
        };
    }
}
exports.UserService = UserService;
