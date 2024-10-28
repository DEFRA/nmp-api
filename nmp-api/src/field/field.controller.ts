import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
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
import { FieldService } from './field.service';
import {
  CreateFieldWithSoilAnalysisAndCropsDto,
  UpdateFieldDto,
} from './dto/field.dto';
import { Request } from 'express';
import FieldEntity from '@db/entity/field.entity';

@ApiTags('Field')
@ApiSecurity('Bearer')
@Controller('fields')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @Get('/:fieldId')
  @ApiOperation({ summary: 'Get field by Field Id' })
  async getFieldById(@Param('fieldId', ParseIntPipe) fieldId: number) {
    const { records } = await this.fieldService.getById(fieldId);
    return { Field: records };
  }

  @Get('/info/:fieldId')
  @ApiOperation({ summary: 'Get Field Crop and Soil details by Field Id' })
  async getFieldCropAndSoilDetails(
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Query('year', ParseIntPipe) year: number,
    @Query('confirm', ParseBoolPipe) confirm: boolean,
  ) {
    const records = await this.fieldService.getFieldCropAndSoilDetails(
      fieldId,
      year,
      confirm,
    );
    return { FieldDetails: records };
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
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    const data = await this.fieldService.createFieldWithSoilAnalysisAndCrops(
      farmId,
      body,
      userId,
    );
    return data;
  }

  @Put('/:fieldId')
  @ApiOperation({ summary: 'Update Field by FieldId' })
  @ApiBody({ type: UpdateFieldDto })
  async updateField(
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body('Field') body: FieldEntity,
    @Req() req: Request,
  ) {
    const userId = req['userId'];
    const Field = await this.fieldService.updateField(body, userId, fieldId);
    return { Field };
  }

  @Delete('/:fieldId')
  @ApiOperation({ summary: 'Delete Field by Field Id' })
  async deleteFieldById(@Param('fieldId', ParseIntPipe) fieldId: number) {
    try {
      await this.fieldService.deleteFieldById(fieldId);
      return { message: 'Field deleted successfully' };
    } catch (error) {
      console.error('Error deleting field:', error);
    }
  }
}
