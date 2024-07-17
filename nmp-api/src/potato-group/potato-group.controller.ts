import { Controller, Get } from '@nestjs/common';
import { PotatoGroupService } from './potato-group.service';
import { ApiTags, ApiSecurity, ApiOperation } from '@nestjs/swagger';

@Controller('potato-groups')
@ApiTags('Potato Groups')
@ApiSecurity('Bearer')
export class PotatoGroupController {
  constructor(private potatoGroupService: PotatoGroupService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of Potato Groups' })
  async getPotatoGroups() {
    const records = await this.potatoGroupService.getPotatoGroups();

    return { PotatoGroups: records };
  }
}
