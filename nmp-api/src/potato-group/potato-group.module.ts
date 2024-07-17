import { Module } from '@nestjs/common';
import { PotatoGroupController } from './potato-group.controller';
import { PotatoGroupService } from './potato-group.service';
import { CropTypePotatoGroupEntity } from '@db/entity/crop-type-potato-group.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RB209ArableService } from '@src/vendors/rb209/arable/arable.service';

@Module({
  imports: [TypeOrmModule.forFeature([CropTypePotatoGroupEntity])],
  controllers: [PotatoGroupController],
  providers: [PotatoGroupService, RB209ArableService],
  exports: [TypeOrmModule],
})
export class PotatoGroupModule {}
