import { Controller, Get, Param, Req } from '@nestjs/common';
import { RB209FieldService } from './field.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('RB209 Field')
@Controller('vendors/rb209/Field')
export class RB209FieldController {
  constructor(private readonly service: RB209FieldService) {}

  @Get('/Countries')
  async getCropGroups(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }
}
