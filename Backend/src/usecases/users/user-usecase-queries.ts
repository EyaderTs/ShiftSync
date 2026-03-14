import { Repository } from 'typeorm';
import QueryConstructor from '../../libs/query-constructor';
import DBContext from '../../../database-context';
import { NotFoundException } from '../../infrastructure/http-exceptions';
import FilterOperators from '../../libs/filter-operators';
import { UserResponse } from './user-response';
import { User } from '../../domains/users/user-model';
import { UserEntity } from '../../persistences/users/user-schema';
// import { EnumRoles } from '../../domains/roles/defined-roles';

class UserQuery {
  static async getUser(id: string, relations: string[] = [], withDeleted: boolean = true) {
    const connection = await DBContext.getConnection();
    const userRepository: Repository<UserEntity> = connection.getRepository(UserEntity);
    const user = await userRepository.findOne({
      where: { userId: id },
      relations,
      withDeleted,
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return UserResponse.toResponse(user);
  }

  static async getUsers(query: any) {
      const connection = await DBContext.getConnection();
      const userRepository: Repository<UserEntity> = connection.getRepository(UserEntity);
      const dataQuery = QueryConstructor.constructQuery(userRepository, query);
      const apiFormat: { count?: number; data?: any[] } = {};
      
     // Debug: Log the generated SQL
    //  console.log('Generated SQL:', dataQuery.getSql());
    
     if (query.count) {
         apiFormat.count = await dataQuery.getCount();
     } else {
         const [result, total] = await dataQuery.getManyAndCount();
        //  console.log('Query Result:', result); // Debug: Check raw result
         apiFormat.count = total;
         apiFormat.data = result.map((user:any) => UserResponse.toResponse(user));
     }
     return apiFormat;
  }
  static async getArchivedUsers(query: any) {
    if (!query.filter) {
      query.filter = [];
    }
    query.filter.push([
      {
        field: 'archived_at',
        operator: FilterOperators.NotNull,
      },
    ]);
    const connection = await DBContext.getConnection();
    const userRepository: Repository<UserEntity> = connection.getRepository(UserEntity);
    const dataQuery = QueryConstructor.constructQuery(userRepository, query);
    dataQuery.withDeleted();
    const apiFormat: { count?: number; data?: any[] } = {};
    
    if (query.count) {
      apiFormat.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      apiFormat.count = total;
      apiFormat.data = result.map((user:any) => UserResponse.toResponse(user));
    }
    return apiFormat;
  }

  static async getMyProfile(id: string) {
    const connection = await DBContext.getConnection();
    const userRepository: Repository<UserEntity> = connection.getRepository(UserEntity);
    const relations = ['userLocations', 'userLocations.location'];
    const user = await userRepository.findOne({
      where: { userId: id },
      relations,
    });
    if (!user) {
      throw new NotFoundException(`User not found`);
    }
    return UserResponse.toResponse(user);
  }

  // static async getMyProfile(id) {
  //   const connection = await DBContext.getConnection();
  //   const userRepository = connection.getRepository(User);
  //   const relations = ['userRoles', 'userRoles.role'];
  //   const user = await userRepository.findOne({
  //     where: { id: id },
  //     relations: relations,
  //   });
  //   if (!user) {
  //     throw new NotFoundException(`User not found`);
  //   }
  //   const roles = [];
  //   if (user.userRoles) {
  //     user.userRoles.forEach((userRole) => {
  //       roles.push(userRole.role.key);
  //     });
  //   }
  //   const customUserClaims = {
  //     roles: roles.length > 0 ? roles.join(',') : '',
  //   };
  //   if (user.userType === UserType.TransporterUser && user.transporterId) {
  //     customUserClaims.transporterId = user.transporterId;
  //     customUserClaims.roles = EnumRoles.TransporterUser;
  //   }
  //   if (user.userType === UserType.ShipperUser && user.shipperId) {
  //     customUserClaims.shipperId = user.shipperId;
  //     customUserClaims.roles = EnumRoles.ShipperUser;
  //   }
  //   if (user.userType === UserType.Driver) {
  //     customUserClaims.roles = EnumRoles.Driver;
  //   }
  //   await admin.auth().setCustomUserClaims(user.id, customUserClaims);
  //   return UserResponse.toResponse(user);
  // }

}

export default UserQuery;
