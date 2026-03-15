import { Router } from "express";
import exceptionHandler from "../infrastructure/filters/exception-handler";
import { AvailabilityController } from "../controllers/availability-controller";

const availabilityRoutes = Router();

availabilityRoutes.post(
  "/create-availability", 
  exceptionHandler(AvailabilityController.createAvailability)
);
availabilityRoutes.get("/get-availabilities", exceptionHandler(AvailabilityController.getAvailabilities));
availabilityRoutes.get("/get-availability/:id", exceptionHandler(AvailabilityController.getAvailability));
availabilityRoutes.patch(
  "/update-availability", 
  exceptionHandler(AvailabilityController.updateAvailability)
);

availabilityRoutes.delete(
  '/delete-availability/:id',
  exceptionHandler(AvailabilityController.deleteAvailability)
);

availabilityRoutes.post(
  '/restore-availability/:id',
  exceptionHandler(AvailabilityController.restoreAvailability)
);

availabilityRoutes.delete(
  '/archive-availability/:id',
  exceptionHandler(AvailabilityController.archiveAvailability)
);

export default availabilityRoutes;
