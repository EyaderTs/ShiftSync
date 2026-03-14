import { Request, Response } from 'express';
import { UserCommand } from '../usecases/users/user-usecase-commands';
import UserQuery from '../usecases/users/user-usecase-queries';
import { BadRequestException } from '../infrastructure/http-exceptions';
import MinIOService from '../common/minio-service';
import { BUCKETS } from '../common/global-config';

interface CustomRequest extends Request {
  currentUser?: {
    userId: number;
    // Add other properties of currentUser if needed
  };
  file?: Express.Multer.File;
}
export class UserController {

static async createUser(req: CustomRequest, res: Response): Promise<void> {
  try {
    const userData = req.body;
    const uploadedFile = req.file;
    
    // Parse userLocations if it's a string (from FormData)
    if (userData.userLocations && typeof userData.userLocations === 'string') {
      try {
        userData.userLocations = JSON.parse(userData.userLocations);
        // If it's still a string after parsing (double-stringified), parse again
        if (typeof userData.userLocations === 'string') {
          userData.userLocations = JSON.parse(userData.userLocations);
        }
      } catch (e) {
        // If parsing fails, set to empty array
        userData.userLocations = [];
      }
    }
    
    // If userLocations is an empty array or string "[]", set to empty array
    if (Array.isArray(userData.userLocations) && userData.userLocations.length === 0) {
      userData.userLocations = [];
    }
    
    // Create user first to get the userId
    let newItem = await UserCommand.create(userData);
    
    // If file is uploaded, upload it to MinIO and update user profile picture
    if (uploadedFile) {
      const userId = (newItem as any).userId;
      // Get file extension from original name or infer from mimetype
      let fileExtension = uploadedFile.originalname.split('.').pop()?.toLowerCase();
      if (!fileExtension) {
        if (uploadedFile.mimetype.includes('jpeg')) fileExtension = 'jpg';
        else if (uploadedFile.mimetype.includes('png')) fileExtension = 'png';
        else if (uploadedFile.mimetype.includes('pdf')) fileExtension = 'pdf';
        else fileExtension = 'jpg'; // default fallback
      }
      const objectName = `profile-${userId}.${fileExtension}`;
      
      const profilePictureUrl = await MinIOService.uploadFile(
        BUCKETS.USER_PROFILE_PICTURES,
        objectName,
        uploadedFile.buffer,
        uploadedFile.mimetype
      );
      
      // Update user with profile picture URL
      const updatedUser = await UserCommand.update({
        userId: userId,
        profilePicture: profilePictureUrl
      });
      
      newItem = updatedUser;
    }
    
    res.status(201).json(newItem);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      status: error.status || 'error',
      statusCode: error.statusCode || 500,
      message: error.message,
      error: error.error || 'Internal Server Error'
    });
  }
}
static async getUsers(req:Request, res:Response) {
  const users = await UserQuery.getUsers(req.query);
  res.status(200).json(users);
}

static async getUser(req:Request, res:Response) {
  const id = req.params.id as string;
  let includes: string[] = [];
  // req.query.includes = "userLocations,userLocations.location";  //pass the schema you want with this is the format if you want to fetch any data with the related schema.
    if (req.query.includes) {
      includes = typeof req.query.includes === 'string' 
      ? req.query.includes.split(',')
      : (req.query.includes as string[]).map(String);
    }
  const user = await UserQuery.getUser(id, includes, true);
  res.status(200).json(user);
}

static async updateUser(req: CustomRequest, res: Response): Promise<void> {
  try {
    const userData = req.body;
    const uploadedFile = req.file;
    
    // Parse userLocations if it's a string (from FormData)
    if (userData.userLocations && typeof userData.userLocations === 'string') {
      try {
        userData.userLocations = JSON.parse(userData.userLocations);
        // If it's still a string after parsing (double-stringified), parse again
        if (typeof userData.userLocations === 'string') {
          userData.userLocations = JSON.parse(userData.userLocations);
        }
      } catch (e) {
        // If parsing fails, set to empty array
        userData.userLocations = [];
      }
    }
    
    // If userLocations is an empty array, set to empty array
    if (Array.isArray(userData.userLocations) && userData.userLocations.length === 0) {
      userData.userLocations = [];
    }
    
    // If file is uploaded, handle profile picture replacement
    if (uploadedFile && userData.userId) {
      const userId = userData.userId;
      
      // Get file extension from original name or infer from mimetype
      let fileExtension = uploadedFile.originalname.split('.').pop()?.toLowerCase();
      if (!fileExtension) {
        if (uploadedFile.mimetype.includes('jpeg')) fileExtension = 'jpg';
        else if (uploadedFile.mimetype.includes('png')) fileExtension = 'png';
        else if (uploadedFile.mimetype.includes('pdf')) fileExtension = 'pdf';
        else fileExtension = 'jpg'; // default fallback
      }
      const objectName = `profile-${userId}.${fileExtension}`;
      
      // Delete old profile pictures with any extension (jpg, png, pdf, jpeg, etc.)
      const possibleExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'gif', 'webp'];
      for (const ext of possibleExtensions) {
        try {
          const oldObjectName = `profile-${userId}.${ext}`;
          const oldFileExists = await MinIOService.fileExists(
            BUCKETS.USER_PROFILE_PICTURES,
            oldObjectName
          );
          if (oldFileExists) {
            await MinIOService.deleteFile(
              BUCKETS.USER_PROFILE_PICTURES,
              oldObjectName
            );
            console.log(`Old profile picture deleted: ${oldObjectName}`);
          }
        } catch (error) {
          // If deletion fails, continue (file might not exist)
          continue;
        }
      }
      
      // Upload new profile picture
      const profilePictureUrl = await MinIOService.uploadFile(
        BUCKETS.USER_PROFILE_PICTURES,
        objectName,
        uploadedFile.buffer,
        uploadedFile.mimetype
      );
      
      // Add profile picture URL to userData
      userData.profilePicture = profilePictureUrl;
    }
    
    // const currentUser = req.currentUser;
    // userData.updatedBy = currentUser.userId;
    const newItem = await UserCommand.update(userData);
    res.status(200).json(newItem);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({
      status: error.status || 'error',
      statusCode: error.statusCode || 500,
      message: error.message,
      error: error.error || 'Internal Server Error'
    });
  }
}
static async deleteUser(req:CustomRequest, res:Response) {
  const user = await UserCommand.delete(req.params.id as string);
  return res.status(200).json(user);
}

static async archiveUser(req:CustomRequest, res:Response) {
  const user = await UserCommand.archive(req.params.id as string);
  return res.status(200).json(user);
}

static async restoreUser(req:Request, res:Response) {
  const user = await UserCommand.restore(req.params.id as string);
  return res.status(200).json(user);
}
static async getMyProfile(req:CustomRequest, res:Response) {
  const user = await UserQuery.getMyProfile(req.currentUser?.userId.toString() || '');
  return res.status(200).json(user);
}

// static async changePassword(req: Request, res: Response): Promise<void> {
//   const payload = req.body;
//   const currentUser = req.currentUser;
//   payload.currentUserId = currentUser.userId;
//   const user = await UserCommand.changePassword(payload);
//   res.status(200).json(user);
// }
}