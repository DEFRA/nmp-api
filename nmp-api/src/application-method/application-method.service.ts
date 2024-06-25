import { ApplicationMethodEntity } from '@db/entity/application-method.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class ApplicationMethodService {
  constructor(
    @InjectRepository(ApplicationMethodEntity)
    private readonly applicationMethodRepository: Repository<ApplicationMethodEntity>,
  ) {}

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
}
