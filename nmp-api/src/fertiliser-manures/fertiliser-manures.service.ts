import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { BaseService } from '../base/base.service';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';
import { ApiDataResponseType } from '@shared/base.response';
import ManagementPeriodEntity from '@db/entity/management-period.entity';
import UserEntity from '@db/entity/user.entity';

@Injectable()
export class FertiliserManuresService extends BaseService<
  FertiliserManuresEntity,
  ApiDataResponseType<FertiliserManuresEntity>
> {
  constructor(
    @InjectRepository(FertiliserManuresEntity)
    protected readonly repository: Repository<FertiliserManuresEntity>,
    protected readonly entityManager: EntityManager,
    @InjectRepository(ManagementPeriodEntity)
    private readonly managementPeriodRepository: Repository<ManagementPeriodEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super(repository, entityManager);
  }

  async createFertiliserManures(
    data: Partial<FertiliserManuresEntity>,
  ): Promise<FertiliserManuresEntity> {
    // Validate ManagementPeriodID
    if (data.ManagementPeriodID) {
      const managementPeriod = await this.managementPeriodRepository.findOne({
        where: { ID: data.ManagementPeriodID },
      });
      if (!managementPeriod) {
        throw new NotFoundException(
          `ManagementPeriod with ID ${data.ManagementPeriodID} not found`,
        );
      }
    }

    // Validate CreatedByID
    if (data.CreatedByID) {
      const user = await this.userRepository.findOne({
        where: { ID: data.CreatedByID },
      });
      if (!user) {
        throw new NotFoundException(
          `User with ID ${data.CreatedByID} not found`,
        );
      }
    }

    const fertiliserManures = this.repository.create(data);
    return this.repository.save(fertiliserManures);
  }
}
