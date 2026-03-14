import { Router } from "express";
import exceptionHandler from "../infrastructure/filters/exception-handler";
import { SkillController } from "../controllers/skill-controller";
import { fileUploader } from "../middleware/file-uploader";

const skillRoutes = Router();

skillRoutes.post(
  "/create-skill", 
  fileUploader.single('skillLogo'),
  exceptionHandler(SkillController.createSkill)
);
skillRoutes.get("/get-skills", exceptionHandler(SkillController.getSkills));
skillRoutes.get("/get-skill/:id", exceptionHandler(SkillController.getSkill));
skillRoutes.patch(
  "/update-skill", 
  fileUploader.single('skillLogo'),
  exceptionHandler(SkillController.updateSkill)
);

skillRoutes.delete(
  '/delete-skill/:id',
  // If you have role guards, uncomment and adjust as needed
  // exceptionHandler(RoleGuard([EnumRoles.Admin])),
  exceptionHandler(SkillController.deleteSkill)
);

skillRoutes.post(
  '/restore-skill/:id',
  // If you have role guards, uncomment and adjust as needed
  // exceptionHandler(RoleGuard([EnumRoles.Admin])),
  exceptionHandler(SkillController.restoreSkill)
);

skillRoutes.delete(
  '/archive-skill/:id',
  // If you have role guards, uncomment and adjust as needed
  // exceptionHandler(RoleGuard([EnumRoles.Admin])),
  exceptionHandler(SkillController.archiveSkill)
);

export default skillRoutes; 