import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FieldService } from './field.service';
import { CreateFieldWithSoilAnalysisAndCropsDto } from './dto/field.dto';

@ApiTags('Field')
@Controller('fields')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @Get('/:fieldId')
  @ApiOperation({ summary: 'Get field by Field Id' })
  async getFieldById(@Param('fieldId', ParseIntPipe) fieldId: number) {
    const { records } = await this.fieldService.getById(fieldId);
    return { Field: records };
  }

  @Get('/farms/:farmId')
  @ApiOperation({ summary: 'Get Fields by Farm Id' })
  @ApiQuery({ name: 'shortSummary', required: false })
  async getFieldsByFarmId(
    @Param('farmId', ParseIntPipe) farmId: number,
    @Query('shortSummary', new ParseBoolPipe({ optional: true }))
    shortSummary: boolean,
  ) {
    let selectOptions = {};
    if (shortSummary) selectOptions = { ID: true, Name: true, FarmID: true };
    const records =
      (await this.fieldService.getBy('FarmID', farmId, selectOptions))
        ?.records || [];
    return { Fields: records };
  }

  @Get('/farms/:farmId/count')
  @ApiOperation({ summary: 'Get fields count by Farm Id' })
  async getFarmFieldsCount(@Param('farmId', ParseIntPipe) farmId: number) {
    const count = await this.fieldService.countRecords({ FarmID: farmId });
    return { count };
  }

  @Get('/farms/:farmId/exists')
  @ApiOperation({
    summary: 'Api to check field exists using Farm Name and Farm Id',
  })
  async checkFarmFieldExists(
    @Param('farmId', ParseIntPipe) farmId: number,
    @Query('Name') name: string,
  ) {
    const exists = await this.fieldService.checkFieldExists(farmId, name);
    return { exists };
  }

  @Post('/farms/:farmId')
  @ApiOperation({
    summary: 'Create Field along with Soil Analyses and Crops api',
  })
  async createFieldWithSoilAnalysisAndCrops(
    @Param('farmId', ParseIntPipe) farmId: number,
    @Body() body: CreateFieldWithSoilAnalysisAndCropsDto,
  ) {
    const data = await this.fieldService.createFieldWithSoilAnalysisAndCrops(
      farmId,
      body,
    );
    return data;
  }
}
