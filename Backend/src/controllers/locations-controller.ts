import { Request, Response } from 'express';
import { LocationQuery } from '../usecases/locations/location-usecase-queries';
import { LocationCommand } from '../usecases/locations/location-usecase-commands';

interface CustomRequest extends Request {
  currentUser?: {
    userId: number;
    // Add other properties of currentUser if needed
  };
}
export class LocationsController {
  static async createLocation(req: CustomRequest, res: Response): Promise<void> {
    try {
      const locationData = req.body;
      const currentUser = req.currentUser;
      locationData.createdBy = currentUser?.userId;
      locationData.createdAt = new Date();
      const newItem = await LocationCommand.create(locationData);
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

  static async getLocations(req: Request, res: Response): Promise<void> {
    const locations = await LocationQuery.getLocations(req.query);
    res.status(200).json(locations);
  }

  static async getLocation(req: Request, res: Response): Promise<void> {
    const id = req.params.id as string;
    let includes: string[] = [];

    if (req.query.includes) {
      includes = typeof req.query.includes === 'string'
        ? req.query.includes.split(',')
        : Array.isArray(req.query.includes) ? req.query.includes.map(String) : [];
    }
    const location = await LocationQuery.getLocation(id, includes, true);
    res.status(200).json(location);
  }

  static async updateLocation(req: CustomRequest, res: Response): Promise<void> {
    const locationData = req.body;
    const currentUser = req.currentUser;
    locationData.updatedBy = currentUser?.userId;
    locationData.UpdatedAt = new Date();
    const newItem = await LocationCommand.update(locationData);
    res.status(200).json(newItem);
  }

  static async deleteLocation(req: Request, res: Response): Promise<void> {
    await LocationCommand.delete(req.params.id as string);
    res.status(200).json({ 
      data: { 
        code: 200, 
        message: 'Location deleted successfully' 
      } 
    });
  }

  static async archiveLocation(req: Request, res: Response): Promise<void> {
    const location = await LocationCommand.archive(req.params.id as string);
    res.status(200).json(location);
  }

  static async restoreLocation(req: Request, res: Response): Promise<void> {
    const location = await LocationCommand.restore(req.params.id as string);
    res.status(200).json(location);
  }
}
