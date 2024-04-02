import BaseRepository from '@db/repository/base/base.repository';
import { Injectable } from '@nestjs/common';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class BaseService<Entity, ResponseType> extends BaseRepository<
  Entity,
  ResponseType
> {
  constructor(
    protected readonly repository: Repository<Entity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
