import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FieldService } from './field.service';

@ApiTags('Field')
@Controller('field')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @Get('/farm/:farmId/count')
  async getFarmFieldsCount(@Param('farmId', ParseIntPipe) farmId: number) {
    const count = await this.fieldService.countRecords({ FarmID: farmId });
    return { count };
  }
}
