import { Module } from '@nestjs/common';
import { InorganicManureDurationController } from './inorganic-manure-duration.controller';
import { InorganicManureDurationService } from './inorganic-manure-duration.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InOrganicManureDurationEntity } from '@db/entity/inorganic-manure-duration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InOrganicManureDurationEntity])],
  controllers: [InorganicManureDurationController],
  providers: [InorganicManureDurationService],
  exports: [TypeOrmModule],
})
export class InorganicManureDurationModule {}
