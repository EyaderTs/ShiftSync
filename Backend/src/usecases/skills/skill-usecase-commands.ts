import { BaseRepository } from '../../persistences/base-repository';
import { Skill } from '../../domains/skill/skill-models';
import { SkillResponse } from './skill-response';
import { NotFoundException, BadRequestException } from '../../infrastructure/http-exceptions';
import { SkillEntity } from '../../persistences/skills/skill-schema';

export class SkillCommand {
  static async create(skill: Partial<Skill>): Promise<Skill> {
    if (!skill.name) {
      throw new BadRequestException('Skill name is required');
    }

    // Check if skill with same name already exists
    if (skill.name) {
      const skillWithName = await BaseRepository.getItemByCustomField(
        SkillEntity, 
        'name', 
        skill.name, 
        [], 
        true
      );
      
      if (skillWithName) {
        throw new BadRequestException('Skill with this name already exists');
      }
    }

    const newSkill = await BaseRepository.save(SkillEntity, skill);
    return SkillResponse.toResponse(newSkill);
  }

  static async update(skillPayload: Skill): Promise<Skill> {
    if (!skillPayload.skillId) {
      throw new BadRequestException('Skill ID is required');
    }

    let skill: SkillEntity | null = await BaseRepository.getByPrimaryKey(
      SkillEntity, 
      'skillId', 
      skillPayload.skillId, 
      [], 
      true
    );
    
    if (!skill) throw new NotFoundException('Skill not found');

    // Check if skill name is being changed and if it already exists
    if (
      skillPayload.name &&
      skill.name !== skillPayload.name
    ) {
      const skillWithName = await BaseRepository.getItemsByCustomField(
        SkillEntity,
        'name',
        skillPayload.name,
        [],
        true,
        1
      );
      
      if (skillWithName && skillWithName.length > 0) {
        throw new BadRequestException('Skill with this name already exists');
      }
    }

    const updatedSkill = { ...skill, ...skillPayload };
    const savedSkill = await BaseRepository.save(SkillEntity, updatedSkill);
    return SkillResponse.toResponse(savedSkill);
  }

  static async delete(id: string): Promise<void> {
    const skill = await BaseRepository.getByPrimaryKey(
      SkillEntity, 
      'skillId', 
      id, 
      [], 
      true
    );
    
    if (!skill) throw new NotFoundException('Skill not found');
    await BaseRepository.delete(SkillEntity, id, 'skillId');
  }

  static async archive(id: string): Promise<Skill> {
    const skill = await BaseRepository.getByPrimaryKey(
      SkillEntity, 
      'skillId', 
      id, 
      [], 
      true
    );
    
    if (!skill) throw new NotFoundException('Skill not found');
    const result = await BaseRepository.archive(SkillEntity, id, 'skillId');
    if (result) skill.archivedAt = new Date();
    return SkillResponse.toResponse(skill);
  }

  static async restore(id: string): Promise<Skill> {
    const skill = await BaseRepository.getByPrimaryKey(
      SkillEntity, 
      'skillId', 
      id, 
      [], 
      true
    );
    
    if (!skill) throw new NotFoundException('Skill not found');
    const result = await BaseRepository.restore(SkillEntity, id, 'skillId');
    if (result) skill.archivedAt = undefined;
    return SkillResponse.toResponse(skill);
  }
} 