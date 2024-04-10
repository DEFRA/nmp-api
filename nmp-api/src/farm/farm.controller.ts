import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserFarmsService } from '@src/user-farms/user-farms.service';

@ApiTags('Farm')
@Controller('farm')
export class FarmController {
  constructor(private readonly userFarmsService: UserFarmsService) {}

  @Get('/user-id/:userId')
  async getFarmsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return await this.userFarmsService.getUserFarms(userId);
  }
}
