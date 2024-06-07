import { ApplicationMethodsIncorpMethodEntity } from '@db/entity/application-method-incorp-method.entity';
import { IncorporationMethodEntity } from '@db/entity/incorporation-method.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class IncorporationMethodService {
  constructor(
    @InjectRepository(IncorporationMethodEntity)
    private readonly incorporationMethodRepository: Repository<IncorporationMethodEntity>,
    @InjectRepository(ApplicationMethodsIncorpMethodEntity)
    private readonly appMethodIncorpMethodRepository: Repository<ApplicationMethodsIncorpMethodEntity>,
  ) {}

  async getIncorporationMethodsByAppId(appId: number): Promise<IncorporationMethodEntity[]> {
    const appMethodsIncorpMethods = await this.appMethodIncorpMethodRepository.find({
      where: { ApplicationMethodID: appId },
      relations: ['IncorporationMethods'],
    });

    return appMethodsIncorpMethods.map(amim => amim.IncorporationMethods);
  }
}
