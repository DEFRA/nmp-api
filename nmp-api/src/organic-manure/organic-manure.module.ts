import { Module } from '@nestjs/common';
import { OrganicManureController } from './organic-manure.controller';
import { OrganicManureService } from './organic-manure.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrganicManureEntity])],
  controllers: [OrganicManureController],
  providers: [OrganicManureService],
})
export class OrganicManureModule {}
