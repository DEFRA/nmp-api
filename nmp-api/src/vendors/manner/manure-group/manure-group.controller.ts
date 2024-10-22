import { Controller, Get, Param, Req } from '@nestjs/common';
import { MannerManureGroupService } from './manure-group.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Manner manure-groups')
@Controller('vendors/manner/manure-groups')
@ApiSecurity('Bearer')
export class MannerManureGroupController {
  constructor(private readonly service: MannerManureGroupService) {}

  @Get()
  @ApiOperation({
    summary: 'Retrieve all manure groups',
  })
  async getAllManureGroups(@Req() req: Request) {
    const endpoint = req.url.split('/manner')[1];
    return await this.service.getData(endpoint);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve manure group by ID',
  })
  async getManureGroupById(@Param('id') appId: number, @Req() req: Request) {
    const endpoint = req.url.split('/manner')[1];
    return await this.service.getData(endpoint);
  }
}
