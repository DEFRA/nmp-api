import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FieldService } from './field.service';
import { CreateFeildWithSoilAnalysesAndCropsDto } from './dto/field.dto';

@ApiTags('Field')
@Controller('field')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @Get('/farm/:farmId/count')
  async getFarmFieldsCount(@Param('farmId', ParseIntPipe) farmId: number) {
    const count = await this.fieldService.countRecords({ FarmID: farmId });
    return { count };
  }

  @Post('/soil-analyses/crop')
  async createFieldWithSoilAnalysesAndCrops(
    @Body() body: CreateFeildWithSoilAnalysesAndCropsDto,
  ) {
    const data =
      await this.fieldService.createFieldWithSoilAnalysesAndCrops(body);
    return data;
  }
}
