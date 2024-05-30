import {
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SoilAnalysisService } from './soil-analysis.service';

@ApiTags('Soil Analysis')
@Controller('soil-analyses')
@ApiBearerAuth('token')
export class SoilAnalysisController {
  constructor(private readonly soilAnalysisService: SoilAnalysisService) {}

  @Get('/:soilAnalysisId')
  @ApiOperation({ summary: 'Get Soil Analysis by Id' })
  async getSoilAnalysisById(
    @Param('soilAnalysisId', ParseIntPipe) soilAnalysisId: number,
  ) {
    const { records } = await this.soilAnalysisService.getById(soilAnalysisId);
    return { SoilAnalysis: records };
  }

  @Get('/fields/:fieldId')
  @ApiOperation({ summary: 'Get Soil Analyses by Field Id' })
  @ApiQuery({ name: 'shortSummary', required: false })
  async getSoilAnalysesByFieldId(
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Query('shortSummary', new ParseBoolPipe({ optional: true }))
    shortSummary: boolean,
  ) {
    let selectOptions = {};
    if (shortSummary) selectOptions = { ID: true, Date: true, FieldID: true };
    const SoilAnalyses = await this.soilAnalysisService.getBy(
      'FieldID',
      fieldId,
      selectOptions,
    );
    return { SoilAnalyses };
  }
}
