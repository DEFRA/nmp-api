import FarmEntity from '@db/entity/farm.entity';
import UserFarmsEntity from '@db/entity/user-farms.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { DeepPartial, EntityManager, Repository } from 'typeorm';

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

  async createFarm(
    farmBody: DeepPartial<FarmEntity>,
    UserID: number,
    RoleID: number,
  ) {
    return this.entityManager.transaction(
      async (transactionalEntityManager) => {
        const Farm = await transactionalEntityManager.save(
          this.repositoryFarm.create({
            ...farmBody,
            Name: farmBody.Name.trim(),
            Postcode: farmBody.Postcode.trim(),
          }),
        );
        await transactionalEntityManager.save(
          this.repository.create({
            UserID,
            RoleID,
            FarmID: Farm.ID,
          }),
        );
        return Farm;
      },
    );
  }
}
