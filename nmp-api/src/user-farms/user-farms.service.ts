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
          'Farm.ID AS ID',
          'Farm.Name AS Name',
          'Farm.Address1 AS Address1',
          'Farm.Address2 AS Address2',
          'Farm.Address3 AS Address3',
          'Farm.Address4 AS Address4',
          'Farm.PostCode AS PostCode',
          'Farm.CPH AS CPH',
          'Farm.FarmerName AS FarmerName',
          'Farm.BusinessName AS BusinessName',
          'Farm.SBI AS SBI',
          'Farm.STD AS STD',
          'Farm.Telephone AS Telephone',
          'Farm.Mobile AS Mobile',
          'Farm.Email AS Email',
          'Farm.Rainfall AS Rainfall',
          'Farm.TotalFarmArea AS TotalFarmArea',
          'Farm.AverageAltitude AS AverageAltitude',
          'Farm.RegistredOrganicProducer AS RegistredOrganicProducer',
          'Farm.MetricUnits AS MetricUnits',
          'Farm.EnglishRules AS EnglishRules',
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
