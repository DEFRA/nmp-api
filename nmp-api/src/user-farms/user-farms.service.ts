import FarmEntity from '@db/entity/farm.entity';
import UserFarmsEntity from '@db/entity/user-farms.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserFarmsService extends BaseService<
  UserFarmsEntity,
  ApiDataResponseType<UserFarmsEntity>
> {
  constructor(
    @InjectRepository(UserFarmsEntity)
    protected readonly repository: Repository<UserFarmsEntity>,
    @InjectRepository(FarmEntity)
    protected readonly repositoryFarm: Repository<FarmEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async getUserFarms(userId: number): Promise<FarmEntity[]> {
    try {
      // service implementation
      const data = await this.repository
        .createQueryBuilder('UserFarms')
        .where('UserFarms.UserID = :userId', { userId })
        .leftJoin('UserFarms.Farm', 'Farm')
        .select('Farm')
        .getRawMany();

      return data;
    } catch (error) {
      console.error('Error while fetching join data:', error);
      throw error;
    }
  }
}