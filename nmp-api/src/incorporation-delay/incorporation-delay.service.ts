import { IncorpMethodsIncorpDelayEntity } from '@db/entity/incorp-method-incorp-delay.entity';
import { IncorporationDelayEntity } from '@db/entity/incorporation-delay.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { BaseService } from '@src/base/base.service';
import { EntityManager, In, Repository } from 'typeorm';

@Injectable()
export class IncorporationDelaysService extends BaseService<
  IncorporationDelayEntity,
  ApiDataResponseType<IncorporationDelayEntity>
> {
  constructor(
    @InjectRepository(IncorporationDelayEntity)
    private readonly incorporationDelayRepository: Repository<IncorporationDelayEntity>,
    @InjectRepository(IncorpMethodsIncorpDelayEntity)
    private readonly incorpMethodsIncorpDelayRepository: Repository<IncorpMethodsIncorpDelayEntity>,
    protected readonly entityManager: EntityManager,
  ) {
    super(incorporationDelayRepository, entityManager);
  }

  async getIncorporationDelays(
    methodId: number,
    applicableFor: string,
  ): Promise<IncorporationDelayEntity[]> {
    const methodDelays = await this.incorpMethodsIncorpDelayRepository.find({
      where: { IncorporationMethodID: methodId },
      relations: ['IncorporationDelay'],
    });
    const incorporationDelaysId = methodDelays.map(
      (md) => md.IncorporationDelayID,
    );
    const incorporationDelays = await this.incorporationDelayRepository.find({
      where: {
        ID: In(incorporationDelaysId),
        ApplicableFor: In([applicableFor, 'A']),
      },
    });

    return incorporationDelays;
  }
}
