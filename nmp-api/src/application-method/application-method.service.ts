import { ManureTypesApplicationMethodEntity } from '@db/entity/manure-type-application-method.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ApplicationMethodService {
  constructor(
    @InjectRepository(ManureTypesApplicationMethodEntity)
    private readonly manureTypesApplicationMethodRepository: Repository<ManureTypesApplicationMethodEntity>,
  ) {}

  async getApplicationMethodsBasedOnManureTypeId(manureTypeId: number) {
    const manureTypesApplicationMethods =
      await this.manureTypesApplicationMethodRepository.find({
        where: { ManureTypeID: manureTypeId },
        relations: ['ApplicationMethods'],
      });

    const applicationMethods = manureTypesApplicationMethods.map(
      (manureTypesApplicationMethod) =>
        manureTypesApplicationMethod.ApplicationMethods,
    );

    return applicationMethods;
  }
}
