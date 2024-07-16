import { Controller, Get, Param } from '@nestjs/common';
import { MannerCropTypesService } from './manner-crop-types.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('manner-crop-types')
@ApiTags('Manure Crop Types')
@ApiSecurity('Bearer')
export class MannerCropTypesController {
  constructor(
    private readonly mannerCropTypesService: MannerCropTypesService,
  ) {}

  @Get(':cropTypeID')
  @ApiOperation({ summary: 'Get MannerCropTypeId and cropUptakeFactor by CropTypeId' })
  async findByCropTypeID(@Param('cropTypeID') cropTypeID: number) {
    return this.mannerCropTypesService.findByCropTypeID(cropTypeID);
  }
}
