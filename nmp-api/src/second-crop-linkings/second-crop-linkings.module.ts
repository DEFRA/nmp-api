import { Module } from '@nestjs/common';
import { SecondCropLinkingsController } from './second-crop-linkings.controller';
import { SecondCropLinkingsService } from './second-crop-linkings.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SecondCropLinkingEntity } from '@db/entity/second-crop-linking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SecondCropLinkingEntity])],
  controllers: [SecondCropLinkingsController],
  providers: [SecondCropLinkingsService],
})
export class SecondCropLinkingsModule {}
