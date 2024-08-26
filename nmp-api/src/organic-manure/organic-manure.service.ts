import { OrganicManureEntity } from '@db/entity/organic-manure.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, Repository } from 'typeorm';
import { CreateOrganicManuresWithFarmManureTypeDto } from './dto/organic-manure.dto';
import FarmManureTypeEntity from '@db/entity/farm-manure-type.entity';
import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';

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
    @InjectRepository(CropEntity)
    protected readonly cropRepository: Repository<CropEntity>,
    @InjectRepository(ManagementPeriodEntity)
    protected readonly managementPeriodRepository: Repository<ManagementPeriodEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(repository, entityManager);
  }

  async getTotalNitrogen(
    managementPeriodID: number,
    fromDate: Date,
    toDate: Date,
  ) {
    const result = await this.repository
      .createQueryBuilder('organicManures')
      .select(
        'SUM(organicManures.N * organicManures.ApplicationRate)',
        'totalN',
      )
      .where('organicManures.ManagementPeriodID = :managementPeriodID', {
        managementPeriodID,
      })
      .andWhere(
        'organicManures.ApplicationDate BETWEEN :fromDate AND :toDate',
        { fromDate, toDate },
      )
      .getRawOne();

    return result.totalN;
  }

  async getManureTypeIdsbyFieldAndYear(
    fieldId: number,
    year: number,
    confirm: boolean,
  ) {
    const cropId = (
      await this.cropRepository.findOne({
        where: { FieldID: fieldId, Year: year, Confirm: confirm },
      })
    ).ID;

    const managementPeriodId = (
      await this.managementPeriodRepository.findOne({
        where: { CropID: cropId },
      })
    ).ID;

    const organicManures = await this.repository.find({
      where: {
        ManagementPeriodID: managementPeriodId,
      },
    });

    const manureTypeIds = organicManures.map((data) => data.ManureTypeID);
    return manureTypeIds;
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
          if (
            OrganicManure.NH4N + OrganicManure.NO3N + OrganicManure.UricAcid >
            OrganicManure.N
          ) {
            throw new BadRequestException(
              'NH4N + NO3N + UricAcid must be less than or equal to TotalN',
            );
          }
          if (organicManureData.SaveDefaultForFarm) {
            farmManureTypeData = {
              FarmID: organicManureData.FarmID,
              ManureTypeID: OrganicManure.ManureTypeID,
              FieldTypeID: organicManureData.FieldTypeID,
              TotalN: OrganicManure.N, //Nitogen
              DryMatter: OrganicManure.DryMatterPercent,
              NH4N: OrganicManure.NH4N, //ammonium
              Uric: OrganicManure.UricAcid, //uric acid
              NO3N: OrganicManure.NO3N, //nitrate
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
