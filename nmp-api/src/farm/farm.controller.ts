import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Farm')
@Controller('farm')
export class FarmController {
  constructor() {}

  @Get('/user-id/:userId')
  async getFarmByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return userId;
  }
}
