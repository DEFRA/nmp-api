import { Controller, Get, Param } from '@nestjs/common';
import { MannerCropTypesService } from './manner-crop-types.service';

@Controller('manner-crop-types')
export class MannerCropTypesController {
  constructor(
    private readonly mannerCropTypesService: MannerCropTypesService,
  ) {}

  @Get(':cropTypeID')
  async findByCropTypeID(@Param('cropTypeID') cropTypeID: number) {
    return this.mannerCropTypesService.findByCropTypeID(cropTypeID);
  }
}
