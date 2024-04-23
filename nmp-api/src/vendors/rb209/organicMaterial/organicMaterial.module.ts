import { Module } from '@nestjs/common';
import { RB209OrganicMaterialService } from './oraganicMaterial.service';
import { RB209OrganicMaterialController } from './organicMaterial.controller';

@Module({
  controllers: [RB209OrganicMaterialController],
  providers: [RB209OrganicMaterialService],
})
export class RB209OrganicMateriaModule {}
