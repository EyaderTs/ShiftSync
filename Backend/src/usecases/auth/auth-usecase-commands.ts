import { BaseRepository } from '../../persistences/base-repository';
import DBContext from '../../../database-context';
import { NotFoundException,BadRequestException } from '../../infrastructure/http-exceptions';
import { User } from '../../domains/users/user-model';
import { UserEntity } from '../../persistences/users/user-schema';
import { UserResponse } from '../users/user-response';
import { Util } from '../../common/utils';
import { EmailService, EmailTemplates } from '../../common/email';

export class AuthCommand {
  static async login(payload:User) {
    const connection = await DBContext.getConnection();
    const userRepository = connection.getRepository(UserEntity);
    const account = await userRepository.findOne({
    where: { email: payload.email },
     relations: ['userLocations', 'userLocations.location'],
     withDeleted: false,
    });
    if (!account) {
      throw new BadRequestException(`Incorrect email or password`);
    }

    if (!Util.comparePassword(payload.password as string, account.password as string)) {
      throw new BadRequestException(`Incorrect email or password`);
    }
    if (account.isActive === false || !account.isActive) {
      throw new BadRequestException(
        `You have been blocked, please contact the admin.`
      );
    }
    const locations: string[] = [];
    if (account.userLocations) {
      account.userLocations.forEach((userLocation) => {
        locations.push(userLocation.location.name as string);
      });
    }
    const tokenClaim = {
      userId: account.userId,
      email: account.email ? account.email : '',
      firstName: account?.firstName,
      lastName: account.lastName,
      roles: account.role,

    //   gender: account.gender,
    //   profile_picture: account.profilepicture,
      phone: account.phone,
      locations: locations.length > 0 ? locations.join(',') : '',
    //   job_title: account.job_title,
    };
    const accessToken = Util.generateToken(tokenClaim, '1h');// make it for 15 minute
    const refreshToken = Util.generateRefreshToken(tokenClaim);
    return {
      accessToken,
      refreshToken,
      profile: {
        ...UserResponse.toResponse(account),
      },
    };
  }
  static async requestPasswordReset(payload: { email: string }) {
    if (!payload.email) {
      throw new BadRequestException('Email is required');
    }

    const connection = await DBContext.getConnection();
    const userRepository = connection.getRepository(UserEntity);
    const account = await userRepository.findOne({
      where: { email: payload.email },
      withDeleted: false,
    });
    
    if (!account) {
      throw new BadRequestException('User not found');
    }

    const secretCode = Util.generateOtpCode();
    (account as any).confirmationCode = secretCode;
    await BaseRepository.save(UserEntity, account);

    // Send password reset email
    try {
      const userName = account.firstName 
        ? `${account.firstName}${account.lastName ? ' ' + account.lastName : ''}`.trim()
        : undefined;
      
      const emailBody = EmailTemplates.passwordResetCode(secretCode, userName);
      
      await EmailService.sendEmail({
        recipients: account.email!,
        subject: 'Password Reset Request - EduBaseEase',
        body: emailBody,
      });
    } catch (emailError) {
      // Log error but don't fail the request - the code is already saved
      console.error('Failed to send password reset email:', emailError);
      // Optionally, you might want to throw an error here if email delivery is critical
      throw new BadRequestException('Failed to send password reset email');
    }

    return {
      message: 'Password reset code sent successfully',
      status: 'success',
    };
  }
  static async verifyPasswordResetCode(payload: { email: string, passwordResetCode: string }) {
    if (!payload.email || !payload.passwordResetCode) {
      throw new BadRequestException('Email and password reset code are required');
    }

    const connection = await DBContext.getConnection();
    const userRepository = connection.getRepository(UserEntity);
    const account = await userRepository.findOne({
      where: { email: payload.email, confirmationCode: payload.passwordResetCode },
      withDeleted: false,
    });

    if (!account) {
      throw new BadRequestException('Invalid email or code');
    }

    return {
      message: 'Password reset code verified successfully',
      status: 'success',
    };
  }
  static async resetPassword(payload: { email: string, passwordResetCode: string, newPassword: string }) {
    if (!payload.email || !payload.passwordResetCode || !payload.newPassword) {
      throw new BadRequestException('Email, password reset code, and new password are required');
    }

    const connection = await DBContext.getConnection();
    const userRepository = connection.getRepository(UserEntity);
    const account = await userRepository.findOne({
      where: { email: payload.email, confirmationCode: payload.passwordResetCode },
      withDeleted: false,
    });

    if (!account) {
      throw new BadRequestException('Invalid email or password reset code');
    }

    // Hash the new password using the same method as user creation
    account.password = Util.hashPassword(payload.newPassword);
    // Clear the confirmation code after successful password reset
    (account as any).confirmationCode = null;
    await BaseRepository.save(UserEntity, account);

    return {
      message: 'Password reset successfully',
      status: 'success',
    };
  }
}
