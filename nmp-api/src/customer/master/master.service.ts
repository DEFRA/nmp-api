import CustomerEntity from '@db/entity/customer.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { EntityManager, Repository } from 'typeorm';
import { BaseService } from '../../base/base.service';

@Injectable()
export class MasterService extends BaseService<
  CustomerEntity,
  ApiDataResponseType<CustomerEntity>
> {
  constructor(
    @InjectRepository(CustomerEntity)
    protected readonly repository: Repository<CustomerEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }
}
