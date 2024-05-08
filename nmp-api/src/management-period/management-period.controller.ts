import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ManagementPeriodService } from './management-period.service';

@ApiTags('Management Period')
@Controller('management-periods')
export class ManagementPeriodController {
  constructor(
    private readonly managementPeriodService: ManagementPeriodService,
  ) {}

  @Get('/:managementPeriodId')
  @ApiOperation({ summary: 'Get Management Period by Id' })
  async getManagementPeriodIdById(
    @Param('managementPeriodId', ParseIntPipe) managementPeriodId: number,
  ) {
    const { records } =
      await this.managementPeriodService.getById(managementPeriodId);
    return { ManagementPeriod: records };
  }

  @Get('/crops/:cropId')
  @ApiOperation({ summary: 'Get Management Period by Crop Id' })
  @ApiQuery({ name: 'shortSummary', required: false })
  async getManagementPeriodByCropId(
    @Param('cropId', ParseIntPipe) cropId: number,
    @Query('shortSummary', new ParseBoolPipe({ optional: true }))
    shortSummary: boolean,
  ) {
    let selectOptions = {};
    if (shortSummary) selectOptions = { ID: true, CropID: true };
    const { records } = await this.managementPeriodService.getBy(
      'CropID',
      cropId,
      selectOptions,
    );
    return { ManagementPeriods: records };
  }
}
