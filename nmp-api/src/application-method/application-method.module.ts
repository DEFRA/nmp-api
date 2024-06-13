import { Module } from '@nestjs/common';
import { ApplicationMethodService } from './application-method.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationMethodController } from './application-method.controller';
import { ManureTypesApplicationMethodEntity } from '@db/entity/manure-type-application-method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ManureTypesApplicationMethodEntity])],
  providers: [ApplicationMethodService],
  controllers: [ApplicationMethodController],
  exports: [TypeOrmModule],
})
export class ApplicationMethodModule {}
