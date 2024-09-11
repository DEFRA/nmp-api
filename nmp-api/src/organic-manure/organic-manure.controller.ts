import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { OrganicManureService } from './organic-manure.service';
import { CreateOrganicManuresWithFarmManureTypeDto } from './dto/organic-manure.dto';

@Controller('organic-manures')
@ApiTags('Organic Manures')
@ApiSecurity('Bearer')
export class OrganicManureController {
  constructor(private readonly organicManureService: OrganicManureService) {}

  @Get('/total-nitrogen/:managementPeriodID')
  @ApiOperation({
    summary:
      'Get Total Nitrogen by ManagementPeriodID and Application Date Range',
  })
  async getTotalNitrogen(
    @Param('managementPeriodID') managementPeriodID: number,
    @Query('fromDate') fromDate: Date,
    @Query('toDate') toDate: Date,
    @Query('confirm') confirm: boolean,
  ) {
    const record = await this.organicManureService.getTotalNitrogen(
      managementPeriodID,
      fromDate,
      toDate,
      confirm,
    );

    return { TotalN: record };
  }

  @Get('/manure-type/:fieldId')
  @ApiOperation({
    summary: 'Get ManureType IDs by FieldId and Harvest Year',
  })
  async getManureTypeIdsByFieldAndYear(
    @Param('fieldId') fieldId: number,
    @Query('year') year: number,
    @Query('confirm') confirm: boolean,
  ) {
    const record =
      await this.organicManureService.getManureTypeIdsbyFieldAndYear(
        fieldId,
        year,
        confirm,
      );
    return { manureTypeIds: record };
  }

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

  @Get('check-existence')
  @ApiQuery({ name: 'dateFrom', type: String, required: true })
  @ApiQuery({ name: 'dateTo', type: String, required: true })
  @ApiQuery({ name: 'confirm', type: Boolean, required: true })
  @ApiResponse({
    description:
      'Check if manure exists within the date range and manure type logic.',
  })
  async checkManureExistence(
    @Query('dateFrom') dateFrom: string,
    @Query('dateTo') dateTo: string,
    @Query('confirm') confirm: boolean,
  ): Promise<{ exists: boolean }> {
    const exists = await this.organicManureService.checkManureExists(
      new Date(dateFrom),
      new Date(dateTo),
      confirm,
    );
    return { exists };
  }
}
