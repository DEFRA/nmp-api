import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { RB209RecommendationService } from './recommendation.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  CalculateNutrientOfftakeDto,
  CalculateNutrientRecommendationsDto,
} from './dto/recommendation.dto';

@ApiTags('RB209 Recommendation')
@ApiBearerAuth('token')
@Controller('vendors/rb209/Recommendation')
export class RB209RecommendationController {
  constructor(private readonly service: RB209RecommendationService) {}

  @Post('/Recommendations')
  @ApiOperation({
    summary: 'The main connection to calculate Nutrient Recommendations',
  })
  @ApiBody({ type: CalculateNutrientRecommendationsDto })
  async calculateNutrientRecommendations(
    @Body() body: CalculateNutrientRecommendationsDto,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.postData(url, body);
  }

  @Post('/CalculateNutrientOfftake')
  @ApiOperation({
    summary: 'The calculate crop nutrient offtake value',
  })
  @ApiBody({ type: CalculateNutrientOfftakeDto })
  async calculateNutrientOfftake(
    @Body() body: CalculateNutrientOfftakeDto,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.postData(url, body);
  }

  @Get(
    '/CalculateNutrientDeficiency/:cropTypeId/:leafSamplingPosition/:nutrientId/:nutrientContent',
  )
  @ApiOperation({
    summary: 'To get the nutrient deficiency result bases on leaf analysis',
  })
  async calculateNutrientDeficiency(
    @Param('cropTypeId') cropTypeId: string,
    @Param('leafSamplingPosition') leafSamplingPosition: string,
    @Param('nutrientId') nutrientId: string,
    @Param('nutrientContent') nutrientContent: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }
}
