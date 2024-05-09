import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';

import { ApiOperation } from '@nestjs/swagger';
import { CreateCropWithManagementPeriodsDto } from '@src/crop/dto/crop.dto';
import { RecommendationService } from './recommendation.service';

@Controller('recommendations')
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  @Post('/fields/:fieldId')
  @ApiOperation({ summary: 'Create Recommendations for field by Field Id' })
  async createRecommendationsForField(
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body() body: CreateCropWithManagementPeriodsDto,
  ) {
    const data =
      await this.recommendationService.createRecommendationsForFieldByFieldId(
        fieldId,
        body.Crop,
        body.ManagementPeriods,
      );
    return data;
  }
}
