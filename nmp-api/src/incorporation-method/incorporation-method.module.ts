import { Module } from '@nestjs/common';
import { IncorporationMethodService } from './incorporation-method.service';
import { IncorporationMethodController } from './incorporation-method.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncorporationMethodEntity } from '@db/entity/incorporation-method.entity';
import { ApplicationMethodsIncorpMethodEntity } from '@db/entity/application-method-incorp-method.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IncorporationMethodEntity,
      ApplicationMethodsIncorpMethodEntity,
    ]),
  ],
  providers: [IncorporationMethodService],
  controllers: [IncorporationMethodController],
  exports: [TypeOrmModule],
})
export class IncorporationMethodModule {}
