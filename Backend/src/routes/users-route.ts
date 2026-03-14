import { Router } from "express";
import exceptionHandler from "../infrastructure/filters/exception-handler";
import { UserController } from "../controllers/users-controller";
import { fileUploader } from "../middleware/file-uploader";

const userRoutes = Router();

userRoutes.post(
  "/create-user",
  fileUploader.single('profilePicture'),
  exceptionHandler(UserController.createUser)
);
userRoutes.get("/get-users", exceptionHandler(UserController.getUsers));
userRoutes.get("/get-user/:id", exceptionHandler(UserController.getUser));
// userRoutes.get("/getUserInfo", exceptionHandler(UserController.getUserInfo));
userRoutes.patch(
  "/update-user", 
  fileUploader.single('profilePicture'),
  exceptionHandler(UserController.updateUser)
);

userRoutes.delete(
  '/delete-user/:id',
  // exceptionHandler(RoleGuard([EnumRoles.Admin])),
  exceptionHandler(UserController.deleteUser)
);
userRoutes.post(
  '/restore-user/:id',
  // exceptionHandler(RoleGuard([EnumRoles.Admin])),
  exceptionHandler(UserController.restoreUser)
);
userRoutes.delete(
  '/archive-user/:id',
  // exceptionHandler(RoleGuard([EnumRoles.Admin])),
  exceptionHandler(UserController.archiveUser)
);
userRoutes.get("/get-my-profile", exceptionHandler(UserController.getMyProfile));


// userRoutes.post(
//   "/change-password",
//   exceptionHandler(UserController.changePassword)
// );


export default userRoutes;
