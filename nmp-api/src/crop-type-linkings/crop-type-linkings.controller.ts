import { Controller, Get, Param } from '@nestjs/common';
import { CropTypeLinkingsService } from './crop-type-linkings.service';
import { ApiTags, ApiSecurity, ApiOperation } from '@nestjs/swagger';

@Controller('crop-type-linkings')
@ApiTags('Crop Type Linkings')
@ApiSecurity('Bearer')
export class CropTypeLinkingsController {
  constructor(
    private readonly cropTypeLinkingsService: CropTypeLinkingsService,
  ) {}

  @Get('/:cropTypeID')
  @ApiOperation({
    summary: 'Get CropTypeLinking by CropTypeId',
  })
  async getCropTypeLinkingByCropTypeID(
    @Param('cropTypeID') cropTypeID: number,
  ) {
    const record =
      await this.cropTypeLinkingsService.getCropTypeLinkingByCropTypeID(
        cropTypeID,
      );

    return { CropTypeLinking: record };
  }
}
