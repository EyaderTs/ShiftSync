import { BaseRepository } from '../../persistences/base-repository';
import { User } from '../../domains/users/user-model';
import { UserResponse } from './user-response';
import { NotFoundException,BadRequestException } from '../../infrastructure/http-exceptions';
import DBContext from 'database-context';
import { Util } from '../../common/utils';
import { DeepPartial, EntityManager } from 'typeorm';
import { UserEntity } from '../../persistences/users/user-schema';
import { UserLocation } from 'src/domains/location/user-location-model';
import { UserLocationEntity } from '../../persistences/users/user-location-schema';

export class UserCommand {

  static async create(user: Partial<User>): Promise<UserResponse> {
    if (!user.password) {
      throw new BadRequestException('Password is required');
    }
    if (user.email) {
      const userWithEmail = await BaseRepository.getItemByCustomField(UserEntity, 'email', user.email, [], true);
      if (userWithEmail) {
        throw new BadRequestException('User with this email already exists');
      }
    }
  
    user.password = Util.hashPassword(user.password);
    // Store locationIds before deleting userLocations from user object
    const locationIds = user.userLocations ? 
      (Array.isArray(user.userLocations) ? user.userLocations : [user.userLocations]) : 
      [];
    delete user.userLocations;
  
    // First save the user
    let newUser = await BaseRepository.save(UserEntity, user);
  
    if (locationIds.length > 0) {
      // Create userLocations array with proper structure
      const userLocations = locationIds.map(locationId => ({
        userId: newUser.userId,
        locationId: typeof locationId === 'string' ? locationId : locationId.locationId,
        createdBy: user.createdBy,
        updatedBy: user.updatedBy
      }));
      
      // Create a new user object with the userLocations
      const userWithLocations = {
        ...newUser,
        userLocations: userLocations
      };
      
      // Save user with locations
      newUser = await BaseRepository.save(UserEntity, userWithLocations);
    }
  
    // Fetch updated user with relationships
    const updatedUser = await BaseRepository.getByPrimaryKey(
      UserEntity,
      'userId',
      newUser.userId,
      ['userLocations', 'userLocations.location'],
      true
    );
    
    return UserResponse.toResponse(updatedUser!);
  }
    
    static async update(userPayload:User) {
      let user:UserEntity|null = await BaseRepository.getByPrimaryKey(UserEntity, 'userId', userPayload.userId, ['userLocations', 'userLocations.location'], true);
      if (!user) throw new NotFoundException('User not found');
  
      if (
        userPayload.phone &&
        userPayload.phone.length > 0 &&
        user.phone !== userPayload.phone
      ) {
        const userWithPhoneNumber = await BaseRepository.getItemsByCustomField(
          UserEntity,
          'phone',
          userPayload.phone,
          [],
          true,
          1
        );
        if ( userWithPhoneNumber?.length > 0) {
          throw new BadRequestException(
            'User with this phone number already exists'
          );
        }
      }
     
      if (
        userPayload.email &&
        userPayload.email.length > 0 &&
        user.email !== userPayload.email
      ) {
        const userWithEmail = await BaseRepository.getItemsByCustomField(
          UserEntity,
          'email',
          userPayload.email,
          [],
          true,
          1
        );
        if (userWithEmail && userWithEmail.length > 0) {
          throw new BadRequestException('User with this email already exists');
        }
      }
      if (userPayload.password) {
        delete userPayload.password;
      }
      user = { ...user , ...userPayload } as UserEntity;

      const userLocations = Object.assign([], user.userLocations);

      if (userLocations && userLocations.length > 0) {
        user.userLocations = [];
        userLocations.forEach((location: UserLocationEntity) => {
          const userLocation: Partial<UserLocationEntity> = {
            userId: user.userId,
            locationId: location.locationId,
            createdBy: user.createdBy,
            updatedBy: user.updatedBy,
          };
          if (location.userLocationId) {
            userLocation.userLocationId = location.userLocationId;
          }
          user.userLocations?.push(userLocation as UserLocationEntity);
        });
      }

      const newUser = await BaseRepository.save(UserEntity, user);
      return UserResponse.toResponse(newUser);
    }

  
  static async delete(id: string): Promise<void> {
    const user = await BaseRepository.getByPrimaryKey(UserEntity, 'userId', id, [], true);
    if (!user) throw new NotFoundException('User not found');
    await BaseRepository.delete(UserEntity, id, 'userId');
  }

  static async archive(id: string):Promise<UserResponse> {
    const user = await BaseRepository.getByPrimaryKey(UserEntity, 'userId', id, [], true);
    if (!user) throw new NotFoundException('User not found');
    const result = await BaseRepository.archive(UserEntity, id,'userId');
    if (result) user.archivedAt = new Date();
    return UserResponse.toResponse(user);
  }

  static async restore(id:string):Promise<UserResponse> {
    const user = await BaseRepository.getByPrimaryKey(UserEntity, 'userId', id, [], true);
    if (!user) throw new NotFoundException('User not found');
    const result = await BaseRepository.restore(UserEntity, id,'userId');
    if (result) user.archivedAt = undefined;
    return UserResponse.toResponse(user);
  }

  // static async changePassword(payload: { password: string; currentPassword: string; confirmPassword: string; currentUserId: number }): Promise<{ message: string }> {
  //   const connection = await DBContext.getConnection();
  //   const userRepository = connection.getRepository(User);
  //   if (payload.password !== payload.confirmPassword) {
  //     throw new BadRequestException('Password and Confirm Password do not match');
  //   }
  //   const user = await userRepository.findOne({ where: { userId: payload.currentUserId } });
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }
  //   if (!Util.comparePassword(payload.currentPassword, user.hashed_password)) {
  //     throw new BadRequestException('Incorrect old password');
  //   }
  //   user.hashed_password = Util.hashPassword(payload.password);
  //   await userRepository.save(user);
  //   return { message: 'Password updated Successfully' };
  // }

}
