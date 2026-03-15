import { Request, Response } from 'express';
import { AvailabilityCommand } from '../usecases/shifts/availability-usecase-commands';
import AvailabilityQuery from '../usecases/shifts/availability-usecase-queries';

interface CustomRequest extends Request {
  currentUser?: {
    userId: string;
  };
}

export class AvailabilityController {
  static async createAvailability(req: CustomRequest, res: Response): Promise<void> {
    try {
      const availabilityData = req.body;
      const userId = req.currentUser!.userId;
      
      // Handle both single object and array of objects
      const isArray = Array.isArray(availabilityData);
      const dataToProcess = isArray ? availabilityData : [availabilityData];
      
      // Add userId, createdBy, and createdAt to each item
      const enrichedData = dataToProcess.map(item => ({
        ...item,
        userId,
        createdBy: userId,
        createdAt: new Date(),
      }));
      
      if (isArray) {
        // Batch create for recurring availability
        const newAvailabilities = await AvailabilityCommand.createBatch(enrichedData);
        res.status(201).json(newAvailabilities);
      } else {
        // Single create for exception
        const newAvailability = await AvailabilityCommand.create(enrichedData[0]);
        res.status(201).json(newAvailability);
      }
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async getAvailabilities(req: CustomRequest, res: Response) {
    try {
      const availabilities = await AvailabilityQuery.getAvailabilities(req.query);
      res.status(200).json(availabilities);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async getAvailability(req: Request, res: Response) {
    try {
    const id = req.params.id as string;
    let includes: string[] = [];
    
    if (req.query.includes) {
      includes = typeof req.query.includes === 'string' 
        ? req.query.includes.split(',')
        : (req.query.includes as string[]).map(String);
    }
    
      const availability = await AvailabilityQuery.getAvailability(id, includes, true);
      res.status(200).json(availability);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async updateAvailability(req: CustomRequest, res: Response): Promise<void> {
    try {
      const availabilityData = req.body;
      availabilityData.updatedBy = req.currentUser!.userId;
      availabilityData.updatedAt = new Date();
      const updatedAvailability = await AvailabilityCommand.update(availabilityData);
      res.status(200).json(updatedAvailability);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async deleteAvailability(req: CustomRequest, res: Response) {
    try {
      await AvailabilityCommand.delete(req.params.id as string);
      return res.status(200).json({ message: 'Availability deleted successfully' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async archiveAvailability(req: CustomRequest, res: Response) {
    try {
      const availability = await AvailabilityCommand.archive(req.params.id as string);
      return res.status(200).json(availability);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async restoreAvailability(req: Request, res: Response) {
    try {
      const availability = await AvailabilityCommand.restore(req.params.id as string);
      return res.status(200).json(availability);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }
}
