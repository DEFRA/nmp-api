import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { SecondCropLinkingsService } from './second-crop-linkings.service';

@Controller('second-crop-linkings')
@ApiTags('second-crop-linkings')
@ApiSecurity('Bearer')
export class SecondCropLinkingsController {
  constructor(
    private readonly cropTypeLinkingsService: SecondCropLinkingsService,
  ) {}

  @Get('/:firstCropID')
  @ApiOperation({
    summary: 'Get SecondCropTypeLinking by FirstCropId',
  })
  async getSecondCropTypeLinkingByFirstCropId(
    @Param('firstCropID') firstCropID: number,
  ) {
    const record =
      await this.cropTypeLinkingsService.getSecondCropTypeLinkingByFirstCropId(
        firstCropID,
      );

    return { SecondCropID: record };
  }
}
