import { WindspeedEntity } from '@db/entity/wind-speed.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';


@Injectable()
export class WindspeedService extends BaseService<
  WindspeedEntity,
  ApiDataResponseType<WindspeedEntity>
> {
  constructor(
    @InjectRepository(WindspeedEntity)
    protected readonly repository: Repository<WindspeedEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async findAll(): Promise<ApiDataResponseType<WindspeedEntity>> {
    const { records } = await this.getAll();
    return { records };
  }

  async findFirstRow(): Promise<WindspeedEntity> {
    const result = await this.repository.find({
      order: { ID: 'ASC' },
      take: 1,
    });
    const data = result[0];
    return data;
  }
}
