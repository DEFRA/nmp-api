import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiOperation } from '@nestjs/swagger';
import { ManureGroupService } from './manure-group.service';

@ApiTags('Manure Groups')
@Controller('manure-groups')
@ApiSecurity('Bearer')
export class ManureGroupController {
  constructor(private readonly manureGroupService: ManureGroupService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of Manure Groups' })
  async getAllManureGroups() {
    const { records } = await this.manureGroupService.getAll();
    return { ManureGroups: records };
  }

  @Get(':manureGroupId')
  @ApiOperation({ summary: 'Get Manure Group by ManureGroupId' })
  async getManureGroupByManureGroupId(
    @Param('manureGroupId', ParseIntPipe) manureGroupId: number,
  ) {
    const { records } = await this.manureGroupService.getById(manureGroupId);
    return { ManureGroup: records };
  }
}
