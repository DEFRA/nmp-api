import { IncorpMethodsIncorpDelayEntity } from '@db/entity/incorp-method-incorp-delay.entity';
import { IncorporationDelayEntity } from '@db/entity/incorporation-delay.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class IncorporationDelaysService {
  constructor(
    @InjectRepository(IncorporationDelayEntity)
    private readonly incorporationDelayRepository: Repository<IncorporationDelayEntity>,
    @InjectRepository(IncorpMethodsIncorpDelayEntity)
    private readonly incorpMethodsIncorpDelayRepository: Repository<IncorpMethodsIncorpDelayEntity>,
  ) {}

  async getDelaysByMethodId(
    methodId: number,
  ): Promise<IncorporationDelayEntity[]> {
    const methodDelays = await this.incorpMethodsIncorpDelayRepository.find({
      where: { IncorporationMethodID: methodId },
      relations: ['IncorporationDelay'],
    });
    return methodDelays.map((md) => md.IncorporationDelay);
  }
}
