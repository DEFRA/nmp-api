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

  async getUserFarms(userID: number): Promise<FarmEntity[]> {
    try {
      const storedProcedure = 'EXEC dbo.spFarms_GetUserFarms @userID = @0';
      const farms = await this.executeQuery(storedProcedure, [userID]);
      return farms;
    } catch (error) {
      console.error('Error while fetching join data:', error);
      throw error;
    }
  }
}
