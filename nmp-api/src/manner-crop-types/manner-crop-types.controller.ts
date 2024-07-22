import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
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
  @ApiOperation({
    summary: 'Get MannerCropTypeId and cropUptakeFactor by CropTypeId',
  })
  async getMannerCropTypesByCropTypeID(
    @Param('cropTypeID') cropTypeID: number,
  ) {
    const records =
      await this.mannerCropTypesService.getMannerCropTypesByCropTypeID(
        cropTypeID,
      );

    return { MannerCropTypes: records };
  }

  @Get('/mannerCropTypeInfo/:cropTypeID')
  @ApiOperation({
    summary: 'Get MannerCropTypeInfo by CropTypeId',
  })
  async getMannerCropTypeLinkingInfoByCropTypeID(
    @Param('cropTypeID') cropTypeID: number,
  ) {
    const record =
      await this.mannerCropTypesService.getMannerCropTypeLinkingInfoByCropTypeID(
        cropTypeID,
      );

    if (!record) {
      throw new NotFoundException(
        `MannerCropType Info with ID ${cropTypeID} not found`,
      );
    }

    return { MannerCropTypeInfo: record };
  }
}
