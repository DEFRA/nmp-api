import {
  Controller,
  Post,
  Body,
  NotFoundException,
  Req,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { FertiliserManuresService } from './fertiliser-manures.service';
import { ApiTags, ApiBody, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { CreateFertiliserManuresDto } from './dto/create-fertiliser-manures.dto';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';

@ApiTags('Fertiliser Manures')
@Controller('fertiliser-manures')
@ApiSecurity('Bearer')
export class FertiliserManuresController {
  constructor(
    private readonly fertiliserManuresService: FertiliserManuresService,
  ) {}

  @Get('/organic-manures/total-nitrogen/:managementPeriodID')
  @ApiOperation({
    summary:
      'Calculate total nitrogen from Fertiliser and Organic Manures based on ManagementPeriodID.',
  })
  async getTotalNitrogen(
    @Param('managementPeriodID') managementPeriodID: number,
    @Query('confirm') confirm: boolean,
  ) {
    const record = await this.fertiliserManuresService.getTotalNitrogen(
      managementPeriodID,
      confirm,
    );

    return { TotalN: record };
  }

  @Post()
  @ApiOperation({ summary: 'Create Fertiliser Manure api' })
  @ApiBody({ type: CreateFertiliserManuresDto })
  async createFertiliserManure(
    @Body() body: CreateFertiliserManuresDto,
    @Req() req: Request,
  ): Promise<FertiliserManuresEntity[]> {
    const userId = req['userId'];

    try {
      const fertiliserManures =
        await this.fertiliserManuresService.createFertiliserManures(
          body.FertiliserManure,
          userId,
        );

      return fertiliserManures;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
}
