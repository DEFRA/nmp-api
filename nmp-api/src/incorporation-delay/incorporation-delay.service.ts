import { IncorpMethodsIncorpDelayEntity } from '@db/entity/incorp-method-incorp-delay.entity';
import { IncorporationDelayEntity } from '@db/entity/incorporation-delay.entity';
import { IncorporationMethodEntity } from '@db/entity/incorporation-method.entity';
import BaseRepository from '@db/repository/base/base.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiDataResponseType } from '@shared/base.response';
import { EntityManager, In, Repository } from 'typeorm';

@Injectable()
export class IncorporationDelaysService extends BaseRepository<
  IncorporationDelayEntity,
  ApiDataResponseType<IncorporationDelayEntity>
> {
  constructor(
    @InjectRepository(IncorporationDelayEntity)
    private readonly incorporationDelayRepository: Repository<IncorporationDelayEntity>,
    protected readonly entityManager: EntityManager,
    @InjectRepository(IncorpMethodsIncorpDelayEntity)
    private readonly incorpMethodsIncorpDelayRepository: Repository<IncorpMethodsIncorpDelayEntity>,
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

  async findIncorporationDelayById(
    id: number,
  ) {
    // return await this.getById(id);
    const { records } = await this.getById(id);
    if (!records) {
      throw new NotFoundException(
        `Incorporation Delay with ID ${id} not found`,
      );
    }
    return records;

  }
}
