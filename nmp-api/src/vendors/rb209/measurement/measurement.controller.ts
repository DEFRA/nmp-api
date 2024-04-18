import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { RB209MeasurementService } from './measurement.service';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CalculateSnsIndexRequest } from './dto/measurement.dto';

@ApiTags('RB209 Measurement')
@Controller('vendors/rb209/Measurement')
export class RB209MeasurementController {
  constructor(private readonly service: RB209MeasurementService) {}

  @Get('/CropHeights')
  @ApiOperation({ summary: 'Full list of available Crop Heights' })
  async getCropHeights(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/GreenAreaIndexes')
  @ApiOperation({ summary: 'Full list of available Green Area Indexes' })
  async getGreenAreaIndexes(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/ShootNumbers')
  @ApiOperation({ summary: 'Full list of available Shoot Numbers' })
  async getShootNumbers(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/Seasons')
  @ApiOperation({ summary: 'Full list of available Seasons' })
  async getSeasons(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Post('/MeasurementMethod')
  @ApiOperation({
    summary:
      'The connection to calculate SNS Index using the Measurement Method',
  })
  @ApiBody({ type: CalculateSnsIndexRequest, required: false })
  async calculateSnsIndex(
    @Body() body: CalculateSnsIndexRequest,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.postData(url, body);
  }

  @Get('/SmnConversionMethod/:smnValue/:soilLayer')
  @ApiOperation({
    summary: 'The get SMN value to be converted from N/kg to kg/ha',
  })
  @ApiQuery({
    name: 'smnValue',
    description: 'smn value in N/kg',
  })
  @ApiQuery({
    name: 'soilLayer',
    description: 'layer of soil in cm',
  })
  async getSmnConversionMethodBySmnValueAndSoilLayer(
    @Param('smnValue') smnValue: string,
    @Param('soilLayer') soilLayer: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }
}
