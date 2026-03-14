import { Request, Response } from 'express';
import { SkillCommand } from '../usecases/skills/skill-usecase-commands';
import SkillQuery from '../usecases/skills/skill-usecase-queries';

interface CustomRequest extends Request {
  currentUser?: {
    userId: string;
    // Add other properties of currentUser if needed
  };
}

export class SkillController {
  static async createSkill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const skillData = req.body;
      
      skillData.createdBy = req.currentUser!.userId;
      skillData.createdAt = new Date();
      
      const newSkill = await SkillCommand.create(skillData);
      res.status(201).json(newSkill);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        statusCode: error.statusCode || 500,
        message: error.message,
        error: error.error || 'Internal Server Error'
      });
    }
  }

  static async getSkills(req: Request, res: Response) {
    const skills = await SkillQuery.getSkills(req.query);
    res.status(200).json(skills);
  }

  static async getSkill(req: Request, res: Response) {
    const id = req.params.id as string;
    let includes: string[] = [];
    
    if (req.query.includes) {
      includes = typeof req.query.includes === 'string' 
        ? req.query.includes.split(',')
        : (req.query.includes as string[]).map(String);
    }
    
    const skill = await SkillQuery.getSkill(id, includes, true);
    res.status(200).json(skill);
  }

  static async updateSkill(req: CustomRequest, res: Response): Promise<void> {
    const skillData = req.body;
    skillData.updatedBy = req.currentUser!.userId;
    skillData.updatedAt = new Date();
    const updatedSkill = await SkillCommand.update(skillData);
    res.status(200).json(updatedSkill);
  }

  static async deleteSkill(req: CustomRequest, res: Response) {
    await SkillCommand.delete(req.params.id as string);
    return res.status(200).json({ message: 'Budget type deleted successfully' });
  }

  static async archiveSkill(req: CustomRequest, res: Response) {
    const skill = await SkillCommand.archive(req.params.id as string);
    return res.status(200).json(skill);
  }

  static async restoreSkill(req: Request, res: Response) {
    const skill = await SkillCommand.restore(req.params.id as string);
    return res.status(200).json(skill);
  }
} 