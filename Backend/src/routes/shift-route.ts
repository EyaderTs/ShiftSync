import { Router } from "express";
import exceptionHandler from "../infrastructure/filters/exception-handler";
import { ShiftController } from "../controllers/shift-controller";

const shiftRoutes = Router();

shiftRoutes.post(
  "/create-shift", 
  exceptionHandler(ShiftController.createShift)
);
shiftRoutes.get("/get-shifts", exceptionHandler(ShiftController.getShifts));
shiftRoutes.get("/get-shift/:id", exceptionHandler(ShiftController.getShift));
shiftRoutes.patch(
  "/update-shift", 
  exceptionHandler(ShiftController.updateShift)
);

shiftRoutes.delete(
  '/delete-shift/:id',
  exceptionHandler(ShiftController.deleteShift)
);

shiftRoutes.post(
  '/restore-shift/:id',
  exceptionHandler(ShiftController.restoreShift)
);

shiftRoutes.delete(
  '/archive-shift/:id',
  exceptionHandler(ShiftController.archiveShift)
);

shiftRoutes.post(
  '/publish-shift/:id',
  exceptionHandler(ShiftController.publishShift)
);

shiftRoutes.post(
  '/assign-staff',
  exceptionHandler(ShiftController.assignStaff)
);

export default shiftRoutes;
