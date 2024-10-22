import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';
import { MannerRainTypesService } from './rain-types.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';


@Controller('vendors/manner/rain-types')
@ApiTags('Manner rain-types')
@ApiSecurity('Bearer')
export class MannerRainTypesController {
  constructor(private readonly service: MannerRainTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all Raintypes' })
  async getAllRainTypes(@Req() req: Request) {
    const endpoint = req.url.split('/manner')[1];
    return await this.service.getData(endpoint);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve rain type by ID',
  })
  async getRainTypeById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const url = req.url.split('/manner')[1];
    return await this.service.getData(url);
  }
}
