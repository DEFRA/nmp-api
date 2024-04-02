import CustomerEntity from '@db/entity/customer.entity';
import OrderEntity from '@db/entity/order.entity';
import MixedView from '@db/view/mixed.view';
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
    @InjectRepository(OrderEntity)
    protected readonly repositoryOrder: Repository<OrderEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async getJoinData(): Promise<MixedView[]> {
    try {
      const data = await this.repository
        .createQueryBuilder('customer')
        .innerJoinAndSelect('customer.orders', 'orders') // Use 'orders' as the alias
        .getMany();

      return data;
    } catch (error) {
      // Handle error appropriately
      console.error('Error while fetching join data:', error);
      throw error; // Re-throw the error or handle it as needed
    }
  }
}
