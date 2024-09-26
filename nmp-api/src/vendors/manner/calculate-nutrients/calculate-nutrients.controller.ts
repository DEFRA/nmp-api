import { Body, Controller, Post, Req } from '@nestjs/common';
import { MannerCalculateNutrientsService } from './calculate-nutrients.service';
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateManureApplicationDto } from './dto/calculate-nutrients.dto';
import { CalculateSnsIndexRequest } from '@src/vendors/rb209/measurement/dto/measurement.dto';

@ApiTags('Manner calculate-nutrients ')
@Controller('calculate-nutrients')
@ApiSecurity('Bearer')
export class MannerCalculateNutrientsController {
  constructor(private readonly service: MannerCalculateNutrientsService) {}

  @Post()
  @ApiOperation({
    summary: 'Calculate Nutrients from manure Apllications',
  })
  @ApiBody({ type: CreateManureApplicationDto, required: false })
  async calculateNutrients(
    @Body() body: CreateManureApplicationDto,
    @Req() req: Request,
  ) {
    const url = req.url;
    return await this.service.postData(url, body);
  }
}
