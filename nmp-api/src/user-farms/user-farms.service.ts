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
        .select([
          'Farm.Name AS Name',
          'Farm.Address1 AS Address1',
          'Farm.Address2 AS Address2',
          'Farm.Address3 AS Address3',
          'Farm.Address4 AS Address4',
          'Farm.PostCode AS PostCode',
          'Farm.Rainfall AS Rainfall',
          'Farm.RegistredOrganicProducer AS RegistredOrganicProducer',
          'Farm.NVZFields AS NVZFields',
          'Farm.FieldsAbove300SeaLevel AS FieldsAbove300SeaLevel',
        ])
        .getRawMany();

      return data;
    } catch (error) {
      console.error('Error while fetching join data:', error);
      throw error;
    }
  }
}
