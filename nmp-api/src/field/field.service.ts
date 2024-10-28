import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';

import FieldEntity from '@db/entity/field.entity';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';

import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';

import { CreateFieldWithSoilAnalysisAndCropsDto } from './dto/field.dto';
import { CreateCropWithManagementPeriodsDto } from '@src/crop/dto/crop.dto';
import { RB209SoilService } from '@src/vendors/rb209/soil/soil.service';
import { SoilTypeSoilTextureEntity } from '@db/entity/soil-type-soil-texture.entity';
import SnsAnalysesEntity from '@db/entity/sns-analysis.entity';

@Injectable()
export class FieldService extends BaseService<
  FieldEntity,
  ApiDataResponseType<FieldEntity>
> {
  constructor(
    @InjectRepository(FieldEntity)
    protected readonly repository: Repository<FieldEntity>,
    @InjectRepository(SoilAnalysisEntity)
    protected readonly soilAnalysisRepository: Repository<SoilAnalysisEntity>,
    @InjectRepository(CropEntity)
    protected readonly cropRepository: Repository<CropEntity>,
    @InjectRepository(ManagementPeriodEntity)
    protected readonly managementPeriodRepository: Repository<ManagementPeriodEntity>,
    @InjectRepository(SoilTypeSoilTextureEntity)
    protected readonly soilTypeSoilTextureRepository: Repository<SoilTypeSoilTextureEntity>,
    protected readonly entityManager: EntityManager,
    protected readonly rB209SoilService: RB209SoilService,
    @InjectRepository(SnsAnalysesEntity)
    protected readonly snsAnalysisRepository: Repository<SnsAnalysesEntity>,
  ) {
    super(repository, entityManager);
  }

  async getFieldCropAndSoilDetails(
    fieldId: number,
    year: number,
    confirm: boolean,
  ) {
    const crop = await this.cropRepository.findOneBy({
      FieldID: fieldId,
      Year: year,
      Confirm: confirm,
    });

    const soilTypeId = (await this.getById(fieldId)).records.SoilTypeID;

    const soil: any = await this.rB209SoilService.getData(
      `Soil/SoilType/${soilTypeId}`,
    );

    return {
      FieldType: crop.FieldType,
      SoilTypeID: soilTypeId,
      SoilTypeName: soil.soilType,
      SowingDate: crop.SowingDate,
    };
  }

  async checkFieldExists(farmId: number, name: string) {
    return await this.recordExists({ FarmID: farmId, Name: name });
  }

  async throwErrorIfFieldExists(exists: boolean) {
    if (exists)
      throw new Error('Field already exists with this Farm Id and Name');
  }

  async getSoilTextureBySoilTypeId(soilTypeId: number) {
    const soilTexture = await this.soilTypeSoilTextureRepository.findOneBy({
      SoilTypeID: soilTypeId,
    });
    if (soilTypeId == null || !soilTexture) {
      return {
        TopSoilID: null,
        SubSoilID: null,
      };
    }

    return {
      TopSoilID: soilTexture.TopSoilID,
      SubSoilID: soilTexture.SubSoilID,
    };
  }

  async createFieldWithSoilAnalysisAndCrops(
    farmId: number,
    body: CreateFieldWithSoilAnalysisAndCropsDto,
    userId: number,
  ) {
    const exists = await this.checkFieldExists(farmId, body.Field.Name);
    this.throwErrorIfFieldExists(exists);

    const { TopSoilID, SubSoilID } = await this.getSoilTextureBySoilTypeId(
      body.Field.SoilTypeID,
    );

    return await this.entityManager.transaction(
      async (transactionalManager) => {
        const Field = await transactionalManager.save(
          this.repository.create({
            ...body.Field,
            TopSoilID,
            SubSoilID,
            FarmID: farmId,
            CreatedByID: userId,
          }),
        );
        
         let SoilAnalysis=null
        if (body.SoilAnalysis){
          SoilAnalysis = await transactionalManager.save(
            this.soilAnalysisRepository.create({
              ...body.SoilAnalysis,
              FieldID: Field.ID,
              CreatedByID: userId,
            }),
          );

        }

        let SnsAnalysis = null;
        if (body.SnsAnalysis) {
          SnsAnalysis = await transactionalManager.save(
            this.snsAnalysisRepository.create({
              ...body.SnsAnalysis,
              FieldID: Field.ID,
              CreatedByID: userId,
            }),
          );
        }
        const Crops: CreateCropWithManagementPeriodsDto[] = [];
        for (const cropData of body.Crops) {
          const savedCrop = await transactionalManager.save(
            this.cropRepository.create({
              ...cropData.Crop,
              FieldID: Field.ID,
              CreatedByID: userId,
            }),
          );
          const ManagementPeriods: ManagementPeriodEntity[] = [];
          for (const managementPeriod of cropData.ManagementPeriods) {
            const savedManagementPeriod = await transactionalManager.save(
              this.managementPeriodRepository.create({
                ...managementPeriod,
                CropID: savedCrop.ID,
                CreatedByID: userId,
              }),
            );
            ManagementPeriods.push(savedManagementPeriod);
          }
          Crops.push({ Crop: savedCrop, ManagementPeriods });
        }

        return {
          Field,
          SoilAnalysis,
          SnsAnalysis,
          Crops,
        };
      },
    );
  }

  async updateField(
    updatedFieldData: DeepPartial<FieldEntity>,
    userId: number,
    fieldId: number,
  ) {
    const { ID, ...dataToUpdate } = updatedFieldData;
    const { TopSoilID, SubSoilID } = await this.getSoilTextureBySoilTypeId(
      updatedFieldData.SoilTypeID,
    );

    const result = await this.repository.update(fieldId, {
      ...dataToUpdate,
      TopSoilID,
      SubSoilID,
      ModifiedByID: userId,
      ModifiedOn: new Date(),
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Field with ID ${fieldId} not found`);
    }

    const updatedField = await this.repository.findOne({
      where: { ID: fieldId },
    });
    return updatedField;
  }
}
