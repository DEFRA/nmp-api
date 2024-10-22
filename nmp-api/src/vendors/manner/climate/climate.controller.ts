import { Controller, Get, Param, Req } from '@nestjs/common';
import { MannerClimateService } from './climate.service';
import { ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Manner Climate')
@Controller('vendors/manner/climates')
@ApiSecurity('Bearer')
export class MannerClimateController {
  constructor(private readonly service: MannerClimateService) {}

  @Get(':postcode')
  @ApiOperation({ summary: 'Climates list' })
  async getClimateDataByPostCode(
    @Param('postcode') postcode: string,
    @Req() req: Request,
  ) {
    const endpoint = req.url.split('/manner')[1];
    return await this.service.getData(endpoint);
  }

  @Get('/avarage-annual-rainfall/:postcode')
  @ApiOperation({ summary: 'Retrieve average annual rainfall by postcode' })
  async getAverageRainfallByPostcode(
    @Param('postcode') postcode: string,
    @Req() req: Request,
  ) {
    const endpoint = req.url.split('/manner')[1];
    return await this.service.getData(endpoint);
  }
}
