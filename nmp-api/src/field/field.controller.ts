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
import { CreateFeildWithSoilAnalysesAndCropsDto } from './dto/field.dto';

@ApiTags('Field')
@Controller('field')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @Get('/:fieldId')
  @ApiOperation({ summary: 'Get field by Field Id' })
  async getFieldById(@Param('fieldId', ParseIntPipe) fieldId: number) {
    const { records } = await this.fieldService.getById(fieldId);
    return { Field: records };
  }

  @Get('/farm/:farmId')
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

  @Get('/farm/:farmId/count')
  @ApiOperation({ summary: 'Get fields count by Farm Id' })
  async getFarmFieldsCount(@Param('farmId', ParseIntPipe) farmId: number) {
    const count = await this.fieldService.countRecords({ FarmID: farmId });
    return { count };
  }

  @Get('/farm/:farmId/exists')
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

  @Post('/farm/:farmId/soil-analyses/crop')
  @ApiOperation({
    summary: 'Create Field along with Soil Analyses and Crops api',
  })
  async createFieldWithSoilAnalysesAndCrops(
    @Param('farmId', ParseIntPipe) farmId: number,
    @Body() body: CreateFeildWithSoilAnalysesAndCropsDto,
  ) {
    const data = await this.fieldService.createFieldWithSoilAnalysesAndCrops(
      farmId,
      body,
    );
    return data;
  }
}
