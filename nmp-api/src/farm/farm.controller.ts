import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UserFarmsService } from '@src/user-farms/user-farms.service';
import { FarmService } from './farm.service';
import { DeepPartial } from 'typeorm';
import FarmEntity from '@db/entity/farm.entity';
import { CreateFarmRequest } from './dto/farm.dto';

@ApiTags('Farm')
@Controller('farm')
export class FarmController {
  constructor(
    private readonly farmService: FarmService,
    private readonly userFarmsService: UserFarmsService,
  ) {}

  @Get('/user-id/:userId')
  async getFarmsByUserId(@Param('userId', ParseIntPipe) userId: number) {
    const Farms = await this.userFarmsService.getUserFarms(userId);
    return { Farms };
  }

  @Get('/:farmId')
  async getFarmById(@Param('farmId', ParseIntPipe) farmId: number) {
    const Farm = await this.farmService.getById(farmId);
    return { Farm };
  }

  @Post('/')
  @ApiBody({ type: CreateFarmRequest })
  async createFarm(
    @Body('UserID', ParseIntPipe) UserID: number,
    @Body('RoleID', ParseIntPipe) RoleID: number,
    @Body('Farm') farmBody: DeepPartial<FarmEntity>,
  ) {
    const Farm = await this.userFarmsService.createFarm(
      farmBody,
      UserID,
      RoleID,
    );
    return { Farm };
  }
}
