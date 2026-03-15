import { Request, Response } from 'express';
import { ShiftCommand } from '../usecases/shifts/shift-usecase-commands';
import ShiftQuery from '../usecases/shifts/shift-usecase-queries';

interface CustomRequest extends Request {
  currentUser?: {
    userId: string;
  };
}

export class ShiftController {
  static async createShift(req: CustomRequest, res: Response): Promise<void> {
    try {
      const shiftData = req.body;
      
      shiftData.createdBy = req.currentUser!.userId;
      shiftData.createdAt = new Date();
      
      const newShift = await ShiftCommand.create(shiftData);
      res.status(201).json(newShift);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async getShifts(req: Request, res: Response) {
    try {
      const shifts = await ShiftQuery.getShifts(req.query);
      res.status(200).json(shifts);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async getShift(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      let includes: string[] = [];
      
      if (req.query.includes) {
        includes = typeof req.query.includes === 'string' 
          ? req.query.includes.split(',')
          : (req.query.includes as string[]).map(String);
      }
      
      const shift = await ShiftQuery.getShift(id, includes, true);
      res.status(200).json(shift);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async updateShift(req: CustomRequest, res: Response): Promise<void> {
    try {
      const shiftData = req.body;
      shiftData.updatedBy = req.currentUser!.userId;
      shiftData.updatedAt = new Date();
      const updatedShift = await ShiftCommand.update(shiftData);
      res.status(200).json(updatedShift);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async deleteShift(req: CustomRequest, res: Response) {
    try {
      await ShiftCommand.delete(req.params.id as string);
      return res.status(200).json({ message: 'Shift deleted successfully' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async archiveShift(req: CustomRequest, res: Response) {
    try {
      const shift = await ShiftCommand.archive(req.params.id as string);
      return res.status(200).json(shift);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async restoreShift(req: Request, res: Response) {
    try {
      const shift = await ShiftCommand.restore(req.params.id as string);
      return res.status(200).json(shift);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async publishShift(req: CustomRequest, res: Response) {
    try {
      const shift = await ShiftCommand.publish(req.params.id as string);
      return res.status(200).json(shift);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async assignStaff(req: CustomRequest, res: Response) {
    try {
      const { shiftId, userIds } = req.body;
      
      if (!shiftId) {
        return res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: 'Shift ID is required',
          error: 'Bad Request'
        });
      }

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: 'User IDs array is required and must not be empty',
          error: 'Bad Request'
        });
      }

      const result = await ShiftCommand.assignStaff(
        shiftId,
        userIds,
        req.currentUser!.userId
      );

      return res.status(200).json(result);
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
