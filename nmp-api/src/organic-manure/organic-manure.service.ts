import { OrganicManureEntity } from '@db/entity/organic-manure.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, Repository } from 'typeorm';
import { CreateOrganicManuresWithFarmManureTypeDto } from './dto/organic-manure.dto';
import FarmManureTypeEntity from '@db/entity/farm-manure-type.entity';

@Injectable()
export class OrganicManureService extends BaseService<
  OrganicManureEntity,
  ApiDataResponseType<OrganicManureEntity>
> {
  constructor(
    @InjectRepository(OrganicManureEntity)
    protected readonly repository: Repository<OrganicManureEntity>,

    @InjectRepository(FarmManureTypeEntity)
    protected readonly farmManureTypeRepository: Repository<FarmManureTypeEntity>,

    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async createOrganicManuresWithFarmManureType(
    body: CreateOrganicManuresWithFarmManureTypeDto,
    userId: number,
  ) {
    return await this.entityManager.transaction(
      async (transactionalManager) => {
        let savedFarmManureType: FarmManureTypeEntity | undefined;
        let farmManureTypeData: Partial<FarmManureTypeEntity>;
        const organicManures: OrganicManureEntity[] = [];

        for (const organicManureData of body.OrganicManures) {
          const { OrganicManure } = organicManureData;
          if (organicManureData.SaveDefaultForFarm) {
            farmManureTypeData = {
              FarmID: organicManureData.FarmID,
              ManureTypeID: OrganicManure.ManureTypeID,
              FieldTypeID: organicManureData.FieldTypeID,
              TotalN: OrganicManure.N,
              DryMatter: OrganicManure.DryMatterPercent,
              NH4N: OrganicManure.NH4N,
              Uric: OrganicManure.UricAcid,
              NO3N: OrganicManure.NO3N,
              P2O5: OrganicManure.P2O5,
              SO3: OrganicManure.SO3,
              K2O: OrganicManure.K2O,
              MgO: OrganicManure.MgO,
            };
          }

          const savedOrganicManure = await transactionalManager.save(
            this.repository.create({
              ...organicManureData.OrganicManure,
              CreatedByID: userId,
            }),
          );
          organicManures.push(savedOrganicManure);
        }

        if (farmManureTypeData) {
          const existingFarmManureType =
            await this.farmManureTypeRepository.findOne({
              where: {
                FarmID: farmManureTypeData.FarmID,
                ManureTypeID: farmManureTypeData.ManureTypeID,
              },
            });
          if (existingFarmManureType) {
            await this.farmManureTypeRepository.update(
              existingFarmManureType.ID,
              {
                ...farmManureTypeData,
                ModifiedByID: userId,
                ModifiedOn: new Date(),
              },
            );

            savedFarmManureType = {
              ...existingFarmManureType,
              ...farmManureTypeData,
              ModifiedByID: userId,
              ModifiedOn: new Date(),
            };
          } else {
            savedFarmManureType = await transactionalManager.save(
              this.farmManureTypeRepository.create({
                ...farmManureTypeData,
                CreatedByID: userId,
              }),
            );
          }
        }
        return {
          OrganicManures: organicManures,
          FarmManureType: savedFarmManureType,
        };
      },
    );
  }
}
