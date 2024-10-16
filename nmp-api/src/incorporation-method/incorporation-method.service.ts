import { ApplicationMethodsIncorpMethodEntity } from '@db/entity/application-method-incorp-method.entity';
import { IncorporationMethodEntity } from '@db/entity/incorporation-method.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { In, IsNull, EntityManager, Repository } from 'typeorm';

@Injectable()
export class IncorporationMethodService extends BaseService<
  IncorporationMethodEntity,
  ApiDataResponseType<IncorporationMethodEntity>
> {
  constructor(
    @InjectRepository(IncorporationMethodEntity)
    private readonly incorporationMethodRepository: Repository<IncorporationMethodEntity>,
    protected readonly entityManager: EntityManager,
    @InjectRepository(ApplicationMethodsIncorpMethodEntity)
    private readonly appMethodIncorpMethodRepository: Repository<ApplicationMethodsIncorpMethodEntity>,
  ) {
    super(incorporationMethodRepository, entityManager);
  }

  async getIncorporationMethods(
    fieldType: number,
    applicableFor: string,
    appId: number,
  ): Promise<IncorporationMethodEntity[]> {
    const appMethodsIncorpMethods =
      await this.appMethodIncorpMethodRepository.find({
        where: { ApplicationMethodID: appId },
        relations: ['IncorporationMethods'],
      });

    const incorporationMethodIds = appMethodsIncorpMethods.map(
      (amim) => amim.IncorporationMethodID,
    );

    let whereCondition = {};
    if (fieldType === 1) {
      whereCondition = [
        {
          ID: In(incorporationMethodIds),
          ApplicableForArableAndHorticulture: In([applicableFor, 'B']),
        },
        {
          ID: In(incorporationMethodIds),
          ApplicableForArableAndHorticulture: IsNull(),
        },
      ];
    } else if (fieldType === 2) {
      whereCondition = [
        {
          ID: In(incorporationMethodIds),
          ApplicableForGrass: In([applicableFor, 'B']),
        },
        {
          ID: In(incorporationMethodIds),
          ApplicableForGrass: IsNull(),
        },
      ];
    } else {
      throw new BadRequestException(
        'Invalid fieldType. It must be either 1 or 2.',
      );
    }

    const incorporationMethods = await this.incorporationMethodRepository.find({
      where: whereCondition,
    });

    return incorporationMethods;
  }
}
