import { Controller, Get, Param, Req } from '@nestjs/common';
import { RB209RainfallService } from './rainfall.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('RB209 Rainfall')
@Controller('vendors/rb209/RainFall')
export class RB209RainfallController {
  constructor(private readonly service: RB209RainfallService) {}

  @Get('/RainfallAverage/:postcode')
  @ApiQuery({
    name: 'postcode',
    description: 'First half of postcode, eg: AB12',
  })
  @ApiOperation({ summary: 'Average Rainfall of field' })
  async getAverageRainfallByPostcode(
    @Param('postcode') postcode: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }
}
