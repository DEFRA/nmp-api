import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { OrganicManureService } from './organic-manure.service';
import { OrganicManureEntity } from '@db/entity/organic-manure.entity';

@Controller('organic-manures')
@ApiTags('Organic Manures')
@ApiSecurity('Bearer')
export class OrganicManureController {
  constructor(private readonly organicManureService: OrganicManureService) {}

  @Post('/')
  @ApiOperation({ summary: 'Create Organic Manures' })
  async createOrganicManures(@Body() body: OrganicManureEntity) {
    const data = await this.organicManureService.createOrganicManures(body);
    return data;
  }
}
