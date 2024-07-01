import { ApplicationMethodEntity } from '@db/entity/application-method.entity';
import BaseRepository from '@db/repository/base/base.repository';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { EntityManager, In, Repository } from 'typeorm';

@Injectable()
export class ApplicationMethodService extends BaseRepository<
  ApplicationMethodEntity,
  ApiDataResponseType<ApplicationMethodEntity>
> {
  constructor(
    @InjectRepository(ApplicationMethodEntity)
    private readonly applicationMethodRepository: Repository<ApplicationMethodEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(applicationMethodRepository, entityManager);
  }

  async getApplicationMethods(fieldType: number, applicableFor: string) {
    let whereCondition = {};

    if (fieldType == 1) {
      whereCondition = {
        ApplicableForArableAndHorticulture: In([applicableFor, 'B']),
      };
    } else if (fieldType == 2) {
      whereCondition = {
        ApplicableForGrass: In([applicableFor, 'B']),
      };
    } else {
      throw new BadRequestException(
        'Invalid fieldType. It must be either 1 or 2.',
      );
    }

    const applicationMethods = await this.applicationMethodRepository.find({
      where: whereCondition,
    });
    return applicationMethods;
  }

  async getApplicationMethodById(id: number): Promise<ApplicationMethodEntity> {
    const {records} = await this.getById(id);
    if (!records) {
      throw new NotFoundException(`Application Method with ID ${id} not found`);
    }
    return records;
  }
}
