import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { OrganicManureService } from './organic-manure.service';
import { CreateOrganicManuresWithFarmManureTypeDto } from './dto/organic-manure.dto';

@Controller('organic-manures')
@ApiTags('Organic Manures')
@ApiSecurity('Bearer')
export class OrganicManureController {
  constructor(private readonly organicManureService: OrganicManureService) {}

  @Post('/')
  @ApiOperation({
    summary: 'Create Organic Manures along with Farm Manure Type',
  })
  async createOrganicManures(
    @Body() body: CreateOrganicManuresWithFarmManureTypeDto,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    const data =
      await this.organicManureService.createOrganicManuresWithFarmManureType(
        body,
        userId,
      );
    return data;
  }
}
