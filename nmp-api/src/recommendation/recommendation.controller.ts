import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import { ApiSecurity, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { StaticStrings } from '@shared/static.string';

@ApiTags('Recommendations')
@ApiSecurity('Bearer')
@Controller('recommendations')
export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  @Get()
  @ApiOperation({
    summary: 'Get Recommendations for field by Field Id and Harvest Year',
  })
  async getNutrientsRecommendationsForFieldByFieldIdAndHarvestYear(
    @Query('fieldId', new ParseIntPipe({ optional: false })) fieldId: number,
    @Query('harvestYear', new ParseIntPipe({ optional: false }))
    harvestYear: number,
  ) {
    if (!fieldId || !harvestYear) {
      throw new HttpException(
        StaticStrings.ERR_MISSING_PARAMETERS,
        HttpStatus.BAD_REQUEST,
      );
    }
    const Recommendations =
      await this.recommendationService.getNutrientsRecommendationsForField(
        fieldId,
        harvestYear,
      );
    return { Recommendations };
  }
}
