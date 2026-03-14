import DBContext from "../../database-context";
import {
  DataSource,
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  FindOneOptions,
  EntityTarget,
  ObjectLiteral,
  DeepPartial,
} from "typeorm";

export class BaseRepository<T extends ObjectLiteral> {
  private static async getRepository<T extends ObjectLiteral>(
    Model: EntityTarget<T>
  ): Promise<Repository<T>> {
    const connection: DataSource = await DBContext.getConnection();
    return connection.getRepository<T>(Model);
  }

  static async save<T extends ObjectLiteral>(
    Model: EntityTarget<T>,
    data: DeepPartial<T> | Partial<T>,
  ): Promise<T> {
    const repository: Repository<T> = await this.getRepository(Model);
    return await repository.save(data as DeepPartial<T>);
  }

  static async delete<T extends ObjectLiteral>(
    Model: EntityTarget<T>,
    id: string | number,
    key: keyof T = "id" as keyof T
  ): Promise<boolean> {
    const repository = await this.getRepository(Model);
    const result = await repository.delete({
      [key]: id,
    } as FindOptionsWhere<T>);
    return result.affected ? result.affected > 0 : false;
  }

  static async deleteByAdvanceId<T extends ObjectLiteral>(
    Model: EntityTarget<T>,
    advanceId: string | number
  ): Promise<boolean> {
    return this.delete(Model, advanceId, "advanceid" as keyof T);
  }

  static async archive<T extends ObjectLiteral>(
    Model: EntityTarget<T>,
    id: string | number,
    key: keyof T = "id" as keyof T
  ): Promise<boolean> {
    const repository = await this.getRepository(Model);
    const result = await repository.softDelete({
      [key]: id,
    } as FindOptionsWhere<T>);
    return result.affected ? result.affected > 0 : false;
  }

  static async restore<T extends ObjectLiteral>(
    Model: EntityTarget<T>,
    id: string | number,
    key: keyof T = "id" as keyof T
  ): Promise<boolean> {
    const repository = await this.getRepository(Model);
    const result = await repository.restore({
      [key]: id,
    } as FindOptionsWhere<T>);
    return result.affected ? result.affected > 0 : false;
  }

  static async getById<T extends ObjectLiteral>(
    Model: EntityTarget<T>,
    id: string | number,
    relations: string[] = [],
    withDeleted = false
  ): Promise<T | null> {
    return this.getByPrimaryKey(
      Model,
      "id" as keyof T,
      id,
      relations,
      withDeleted
    );
  }

  static async getByPrimaryKey<T extends ObjectLiteral>(
    Model: EntityTarget<T>,
    key: keyof T,
    value: any,
    relations: string[] = [],
    withDeleted = false
  ): Promise<T | null> {
    const repository = await this.getRepository(Model);
    return await repository.findOne({
      where: { [key]: value } as FindOptionsWhere<T>,
      relations,
      withDeleted,
    } as FindOneOptions<T>);
  }

  static async getAll<T extends ObjectLiteral>(
    Model: EntityTarget<T>,
    relations: string[] = [],
    withDeleted = false
  ): Promise<T[]> {
    const repository = await this.getRepository(Model);
    return await repository.find({
      relations,
      withDeleted,
    } as FindManyOptions<T>);
  }

  static async getItemsByCustomField<T extends ObjectLiteral>(
    Model: EntityTarget<T>,
    field: keyof T,
    value: any,
    relations: string[] = [],
    withDeleted = false,
    limit?: number
  ): Promise<T[]> {
    const repository = await this.getRepository(Model);
    return await repository.find({
      where: { [field]: value } as FindOptionsWhere<T>,
      relations,
      withDeleted,
      take: limit,
    } as FindManyOptions<T>);
  }

  static async getItemByCustomField<T extends ObjectLiteral>(
    Model: EntityTarget<T>,
    field: keyof T,
    value: any,
    relations: string[] = [],
    withDeleted = false
  ): Promise<T | null> {
    return this.getByPrimaryKey(Model, field, value, relations, withDeleted);
  }

  static async getItems<T extends ObjectLiteral>(
    Model: EntityTarget<T>,
    whereOption: FindOptionsWhere<T> = {},
    relations: string[] = [],
    withDeleted = false,
    limit?: number,
    orderBy?: any,
    skip?: number
  ): Promise<T[]> {
    const repository = await this.getRepository(Model);
    return await repository.find({
      where: whereOption,
      relations,
      withDeleted,
      take: limit,
      order: orderBy,
      skip,
    } as FindManyOptions<T>);
  }

  static async getItem<T extends ObjectLiteral>(
    Model: EntityTarget<T>,
    whereOption: FindOptionsWhere<T> = {},
    relations: string[] = [],
    withDeleted = false
  ): Promise<T | null> {
    const repository = await this.getRepository(Model);
    return await repository.findOne({
      where: whereOption,
      relations,
      withDeleted,
    } as FindOneOptions<T>);
  }
}
