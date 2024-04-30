import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SoilAnalysesService } from './soil-analyses.service';

@ApiTags('Soil Analyses')
@Controller('soil-analyses')
export class SoilAnalysesController {
  constructor(private readonly soilAnalysesService: SoilAnalysesService) {}

  @Get('/:soilAnalysesId')
  @ApiOperation({ summary: 'Get Soil Analyses by Id' })
  async getSoilAnalysesById(
    @Param('soilAnalysesId', ParseIntPipe) soilAnalysesId: number,
  ) {
    const { records } = await this.soilAnalysesService.getById(soilAnalysesId);
    return { SoilAnalysis: records };
  }

  @Get('/field/:fieldId')
  @ApiOperation({ summary: 'Get Soil Analyses by Field Id' })
  @ApiQuery({ name: 'shortSummary', required: false })
  async getSoilAnalysesByFieldId(
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Query('shortSummary', new ParseBoolPipe({ optional: true }))
    shortSummary: boolean,
  ) {
    let selectOptions = {};
    if (shortSummary) selectOptions = { ID: true, Date: true, FieldID: true };
    const SoilAnalyses = await this.soilAnalysesService.getBy(
      'FieldID',
      fieldId,
      selectOptions,
    );
    return { SoilAnalyses };
  }
}
