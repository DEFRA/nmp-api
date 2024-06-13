import { ApplicationMethodEntity } from '@db/entity/application-method.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

@Injectable()
export class ApplicationMethodService {
  constructor(
    @InjectRepository(ApplicationMethodEntity)
    private readonly applicationMethodRepository: Repository<ApplicationMethodEntity>,
  ) {}

  async getApplicationMethods(applicableFor: string) {
    const applicationMethods = await this.applicationMethodRepository.find({
      where: { ApplicableFor: In([applicableFor, 'B']) },
    });

    return applicationMethods;
  }
}
