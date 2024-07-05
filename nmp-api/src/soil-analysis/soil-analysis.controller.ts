import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiSecurity,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { SoilAnalysisService } from './soil-analysis.service';
import { UpdateSoilAnalysisDto } from './dto/soil-analysis.dto';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';

@ApiTags('Soil Analysis')
@Controller('soil-analyses')
@ApiSecurity('Bearer')
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

  @Put('/:soilAnalysisId')
  @ApiOperation({ summary: 'Update SoilAnalysis by SoilAnalysisId' })
  @ApiBody({ type: UpdateSoilAnalysisDto })
  async updateSoilAnalysis(
    @Body('SoilAnalysis') body: SoilAnalysisEntity,
    @Param('soilAnalysisId', ParseIntPipe) soilAnalysisId: number,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    const SoilAnalysis = await this.soilAnalysisService.updateSoilAnalysis(
      body,
      userId,
      soilAnalysisId,
    );
    return { SoilAnalysis };
  }
}
