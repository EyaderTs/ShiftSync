import { Router } from "express";
import exceptionHandler from "../infrastructure/filters/exception-handler";
import { LocationsController } from "../controllers/locations-controller";

const locationsRoutes = Router();

// Basic CRUD operations
locationsRoutes.post("/create-location", exceptionHandler(LocationsController.createLocation));
locationsRoutes.get("/get-locations", exceptionHandler(LocationsController.getLocations));
locationsRoutes.get("/get-location/:id", exceptionHandler(LocationsController.getLocation));
locationsRoutes.patch("/update-location", exceptionHandler(LocationsController.updateLocation));
locationsRoutes.delete("/delete-location/:id", exceptionHandler(LocationsController.deleteLocation));

// Archive and restore operations
locationsRoutes.post(
    '/restore-location/:id',
    exceptionHandler(LocationsController.restoreLocation)
  );
  locationsRoutes.delete(
    '/archive-location/:id',
    exceptionHandler(LocationsController.archiveLocation)
  );


export default locationsRoutes;
