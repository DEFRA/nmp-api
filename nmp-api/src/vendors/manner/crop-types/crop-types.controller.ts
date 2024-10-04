import { Controller, Get, Param, ParseIntPipe, Req } from '@nestjs/common';
import { MannerApiCropTypesService } from './crop-types.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Manner crop-types')
@Controller('vendors/manner/crop-types')
@ApiSecurity('Bearer')
export class MannerApiCropTypesController {
  constructor(private readonly service: MannerApiCropTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Retrieve all croptypes' })
  async getAllCropTypes(@Req() req: Request) {
    const auth = req.headers['authorization'];
    const endpoint = req.url.split('/manner')[1];
    return await this.service.getData(endpoint);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve crop types by ID',
  })
  async getApplicationMethodById(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ) {
    const userId = req['userId'];

    const url = req.url.split('/manner')[1];
    return await this.service.getData(url);
  }
}
