import { Controller, Get } from '@nestjs/common';
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
}
