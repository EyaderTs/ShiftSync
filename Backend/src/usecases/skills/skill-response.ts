import { Skill } from '../../domains/skill/skill-models';
import { SkillEntity } from '../../persistences/skills/skill-schema';

export class SkillResponse {
  static toResponse(skill: SkillEntity): Skill {
    return {
      skillId: skill.skillId,
      name: skill.name,
      description: skill.description,
      createdBy: skill.createdBy,
      updatedBy: skill.updatedBy,
      createdAt: skill.createdAt,
      updatedAt: skill.updatedAt,
      archivedAt: skill.archivedAt
    };
  }
}

export default SkillResponse; 