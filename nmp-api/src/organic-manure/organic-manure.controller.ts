import { Body, Controller, Post, Req } from '@nestjs/common';
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
  async createOrganicManures(
    @Body() body: OrganicManureEntity,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    const data = await this.organicManureService.createOrganicManures(
      body,
      userId,
    );
    return data;
  }
}
