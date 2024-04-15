import { HttpException, HttpStatus } from '@nestjs/common';
import {
  DeepPartial,
  EntityManager,
  Like,
  Repository,
  SaveOptions,
} from 'typeorm';
import MutableContract from './mutable.contract';
import ReadContract from './read.contract';

export default class BaseRepository<Entity, ResponseType>
  implements MutableContract<Entity>, ReadContract<ResponseType>
{
  constructor(
    protected readonly repository: Repository<Entity>,
    protected readonly entityManager: EntityManager,
  ) {}

  async getAll(): Promise<ResponseType> {
    const records = (await this.repository.find()) as Entity[];
    return { records } as ResponseType;
  }

  async getById(ID: number): Promise<ResponseType> {
    const records = (await this.repository.findOne({
      where: { ID: ID } as any,
    })) as Entity;
    return { records } as ResponseType;
  }

  async getBy(column: string, value: string): Promise<ResponseType> {
    const records = (await this.repository.find({
      where: { [column]: value } as any,
    })) as Entity[];
    return { records } as ResponseType;
  }

  async search(
    columns: string,
    value: string,
    page: number = 1,
    pageSize: number = 10,
  ): Promise<ResponseType> {
    const columnsArray = columns?.split(',');
    const where = columnsArray.reduce((acc, col) => {
      acc[col] = Like(`%${value}%`);
      return acc;
    }, {});

    const [records, totalCount] = await this.repository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalCount / pageSize);
    const hasPreviousPage = page > 1;
    const hasNextPage = page < totalPages;
    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, totalCount);

    return {
      records,
      settings: {
        totalCount,
        totalPages,
        currentPage: page,
        pageSize,
        hasPreviousPage,
        hasNextPage,
        from,
        to,
      },
    } as ResponseType;
  }

  //----------- Mutation
  async save(
    entity: DeepPartial<Entity>,
    options?: SaveOptions,
  ): Promise<Entity> {
    return this.repository.save(entity, options);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async saveMultiple(entities: DeepPartial<Entity>[]): Promise<Entity[]> {
    return this.repository.save(entities);
  }

  async saveMultipleWithTransaction(
    entities: DeepPartial<Entity>[],
  ): Promise<Entity[]> {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const savedEntities: Entity[] = [];
        for (const entity of entities) {
          const savedEntity = await transactionalEntityManager.save(
            this.repository.create(entity),
          );
          savedEntities.push(savedEntity);
        }
        return savedEntities;
      },
    );
  }

  //----Other

  async recordExists(column: string, value: any): Promise<boolean> {
    const count = await this.repository.count({
      where: { [column]: value },
    } as any);
    return count > 0;
  }

  async executeQuery(query: string, parameters: any = []): Promise<any> {
    if (query.toLowerCase().includes('delete')) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'Delete query not allowed',
        },
        HttpStatus.FORBIDDEN,
        {
          cause: 'Unauthorized',
        },
      );
    }
    return this.entityManager.query(query, parameters);
  }
}
