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

  @Get('/cropTypeYield/:cropTypeID')
  @ApiOperation({
    summary: 'Get CropTypeYield by CropTypeId',
  })
  async getCropTypeYieldByCropTypeID(@Param('cropTypeID') cropTypeID: number) {
    const record =
      await this.mannerCropTypesService.getCropTypeYieldByCropTypeID(
        cropTypeID,
      );

    return { CropTypeYield: record };
  }

  @Get('/isPerennial/:cropTypeID')
  @ApiOperation({
    summary: 'Get IsPerennial by CropTypeId',
  })
  async getIsPerennialByCropTypeID(@Param('cropTypeID') cropTypeID: number) {
    const record =
      await this.mannerCropTypesService.getIsPerennialByCropTypeID(cropTypeID);

    return { IsPerennial: record };
  }
}
