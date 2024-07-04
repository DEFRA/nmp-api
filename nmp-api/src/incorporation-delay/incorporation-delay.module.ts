import { IncorpMethodsIncorpDelayEntity } from '@db/entity/incorp-method-incorp-delay.entity';
import { IncorporationDelayEntity } from '@db/entity/incorporation-delay.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncorporationDelaysService } from './incorporation-delay.service';
import { IncorporationDelaysController } from './incorporation-delay.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IncorporationDelayEntity,
      IncorpMethodsIncorpDelayEntity,
    ]),
  ],
  providers: [IncorporationDelaysService],
  controllers: [IncorporationDelaysController],
  exports: [TypeOrmModule],
})
export class IncorporationDelaysModule {}
