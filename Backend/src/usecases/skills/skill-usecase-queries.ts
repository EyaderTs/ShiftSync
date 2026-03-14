import QueryConstructor from '../../libs/query-constructor';
import DBContext from '../../../database-context';
import SkillResponse from './skill-response';
import { SkillEntity } from '../../persistences/skills/skill-schema';
import { NotFoundException } from '../../infrastructure/http-exceptions';
import { BaseRepository } from '../../persistences/base-repository';

export class SkillQuery {
  
  static async getSkills(query: any) {
    const connection = await DBContext.getConnection();
    const skillRepository = connection.getRepository(SkillEntity);
    const dataQuery = QueryConstructor.constructQuery(skillRepository, query);
    
    const apiFormat: any = {};
    
    if (query.count) {
      apiFormat.count = await dataQuery.getCount();
    } else {
      const [result, total] = await dataQuery.getManyAndCount();
      apiFormat.count = total;
      apiFormat.data = result.map((skill: SkillEntity) => SkillResponse.toResponse(skill));
    }
    
    return apiFormat;
  }

  static async getSkill(id: string, includes: string[] = [], withDeleted: boolean = true) {
    const skill = await BaseRepository.getByPrimaryKey(
      SkillEntity,
      'skillId',
      id,
      includes,
      withDeleted
    );
    
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    
    return SkillResponse.toResponse(skill);
  }
}

export default SkillQuery; 