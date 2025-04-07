import { FindOneOptions, FindOptionsWhere, ILike, In } from 'typeorm';
import { BaseRepository } from './base.repository';
import { User } from '../models/user.model';
import { UserFilterOptions } from '../interfaces/user.interface';
import { NotFoundError } from '../utils/error-handler';
import { UserRole } from '../models/user-role.model';

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  /**
   * Encuentra un usuario por email
   * @param email Email del usuario
   * @param includePassword Si se debe incluir la contraseña en el resultado
   * @returns El usuario encontrado o null
   */
  async findByEmail(email: string, includePassword: boolean = false): Promise<User | null> {
    const options: FindOneOptions<User> = {
      where: { email },
      relations: ['userRoles', 'userRoles.role']
    };
  
    if (includePassword) {
      options.select = {
        id: true,
        email: true,
        password: true,
        name: true,
        lastname: true,
        verificado: true,
        phone: true,
        typeid: true,
        numberid: true,
        address: true,
        city_id: true,
        pubname: true,
        privname: true,
        imagebs64: true,
      };
    }
  
    return await this.repository.findOne(options);
  }
  /**
   * Encuentra usuarios por filtros
   * @param filters Filtros para la búsqueda
   * @returns Lista de usuarios que coinciden con los filtros
   */
  async findByFilters(filters: UserFilterOptions): Promise<User[]> {
    const whereOptions: FindOptionsWhere<User> = {};

    if (filters.id !== undefined) {
      whereOptions.id = filters.id;
    }

    if (filters.code) {
      whereOptions.code = filters.code;
    }

    if (filters.email) {
      whereOptions.email = ILike(`%${filters.email}%`);
    }

    if (filters.name) {
      whereOptions.name = ILike(`%${filters.name}%`);
    }

    if (filters.lastname) {
      whereOptions.lastname = ILike(`%${filters.lastname}%`);
    }

    if (filters.typeid) {
      whereOptions.typeid = filters.typeid;
    }

    if (filters.numberid) {
      whereOptions.numberid = ILike(`%${filters.numberid}%`);
    }

    if (filters.verificado !== undefined) {
      whereOptions.verificado = filters.verificado;
    }

    if (filters.city_id !== undefined) {
      whereOptions.city_id = filters.city_id;
    }

    let query = this.repository.createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role');

    // Aplicar filtros al query builder
    if (whereOptions.id) {
      query = query.andWhere('user.id = :id', { id: whereOptions.id });
    }
    
    if (whereOptions.code) {
      query = query.andWhere('user.code = :code', { code: whereOptions.code });
    }
    
    if (whereOptions.email) {
      query = query.andWhere('user.email ILIKE :email', { email: `%${filters.email}%` });
    }
    
    if (whereOptions.name) {
      query = query.andWhere('user.name ILIKE :name', { name: `%${filters.name}%` });
    }
    
    if (whereOptions.lastname) {
      query = query.andWhere('user.lastname ILIKE :lastname', { lastname: `%${filters.lastname}%` });
    }
    
    if (whereOptions.typeid) {
      query = query.andWhere('user.typeid = :typeid', { typeid: whereOptions.typeid });
    }
    
    if (whereOptions.numberid) {
      query = query.andWhere('user.numberid ILIKE :numberid', { numberid: `%${filters.numberid}%` });
    }
    
    if (whereOptions.verificado !== undefined) {
      query = query.andWhere('user.verificado = :verificado', { verificado: whereOptions.verificado });
    }
    
    if (whereOptions.city_id) {
      query = query.andWhere('user.city_id = :city_id', { city_id: whereOptions.city_id });
    }
    
    // Filtrar por rol si se proporciona
    if (filters.role_id !== undefined) {
      query = query.andWhere('role.id = :role_id', { role_id: filters.role_id });
    }

    return await query.getMany();
  }

  /**
   * Asigna un rol a un usuario
   * @param userId ID del usuario
   * @param roleId ID del rol
   * @returns El registro UserRole creado
   */
  async assignRole(userId: number, roleId: number): Promise<UserRole> {
    const userRoleRepository = this.repository.manager.getRepository(UserRole);
    
    // Verificar si ya existe esta asignación
    const existingAssignment = await userRoleRepository.findOne({
      where: { user_id: userId, role_id: roleId }
    });
    
    if (existingAssignment) {
      return existingAssignment;
    }
    
    // Crear nueva asignación
    const userRole = userRoleRepository.create({
      user_id: userId,
      role_id: roleId
    });
    
    return await userRoleRepository.save(userRole);
  }

  /**
   * Elimina un rol de un usuario
   * @param userId ID del usuario
   * @param roleId ID del rol
   * @returns True si se eliminó correctamente
   */
  async removeRole(userId: number, roleId: number): Promise<boolean> {
    const userRoleRepository = this.repository.manager.getRepository(UserRole);
    const result = await userRoleRepository.delete({
      user_id: userId,
      role_id: roleId
    });
    
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  /**
   * Actualiza el token de sesión del usuario
   * @param userId ID del usuario
   * @param token Nuevo token de sesión
   * @returns El usuario actualizado
   */
  async updateSessionToken(userId: number, token: string | null): Promise<User> {
    await this.repository.update(userId, { session_token: token } as any);
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${userId} no encontrado`);
    }
    
    return user;
  }
  
  /**
   * Actualiza el estado de verificación del usuario
   * @param userId ID del usuario
   * @param verified Estado de verificación
   * @returns El usuario actualizado
   */
  async updateVerificationStatus(userId: number, verified: boolean): Promise<User> {
    await this.repository.update(userId, { verificado: verified });
    const user = await this.findById(userId);
    
    if (!user) {
      throw new NotFoundError(`Usuario con ID ${userId} no encontrado`);
    }
    
    return user;
  }
}