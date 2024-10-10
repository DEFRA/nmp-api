import { Controller, Get, Param, ParseIntPipe, Query, Req } from '@nestjs/common';
import { MannerIncorporationDelayService } from './incorporation-delay.service';
import { ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { IntegerType } from 'typeorm';


@ApiTags('Manner incorporation-delays')
@Controller('vendors/manner/incorporation-delays')
@ApiSecurity('Bearer')
export class MannerIncorporationDelayController {
  constructor(private readonly service: MannerIncorporationDelayService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all incorporation delays',
  })
  async getAllIncorporationDelays(@Req() req: Request) {
    const url = req.url.split('/manner')[1];
    return await this.service.getData(url);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve incorporation Delay by ID',
  })
  async getIncorporationDelayById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const url = req.url.split('/manner')[1];
    return await this.service.getData(url);
  }
  @Get('/by-incorp-method/:methodId')
  @ApiOperation({
    summary: 'Retrieve incorporation delays by incorporation method ID ',
  })
  async getIncorporationDelayByIncorporationId(
    @Param('methodId') methodId: number,
    @Req() req: Request,
  ) {
    const endpoint = req.url.split('/manner')[1];
    return await this.service.getData(endpoint);
  }

  @Get('/by-incorp-method-and-applicable-for/:methodId')
  @ApiOperation({
    summary: 'Retrieve incorporation method by applications method ID',
  })
  @ApiQuery({
    name: 'applicableFor',
    required: true,
    type: String,
    description:
      'Filter by ApplicableFor (L for Liquid, S for Solid, P for Poultry, NULL for N/A or Not Incorporated)',
  })
  async getIncorporationMethodByAppMethodAndApplicableFor(
    @Param('methodId', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const url = req.url.split('/manner')[1];
    return await this.service.getData(url);
  }
}
