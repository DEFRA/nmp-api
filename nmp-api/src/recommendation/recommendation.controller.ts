import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';

import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCropWithManagementPeriodsDto } from '@src/crop/dto/crop.dto';
import { RecommendationService } from './recommendation.service';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  @Post('/fields/:fieldId')
  @ApiOperation({ summary: 'Create Recommendations for field by Field Id' })
  async createNutrientsRecommendationForFieldByFieldId(
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body() body: CreateCropWithManagementPeriodsDto,
  ) {
    const data =
      await this.recommendationService.createNutrientsRecommendationForField(
        fieldId,
        body.Crop,
        body.ManagementPeriods,
      );
    return data;
  }
}
