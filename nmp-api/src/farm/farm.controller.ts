import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { UserFarmsService } from '@src/user-farms/user-farms.service';
import { FarmService } from './farm.service';
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

  @Get('/exists')
  async checkFarmExists(
    @Query('Name') farmName: string,
    @Query('Postcode') postcode: string,
  ) {
    const exists = await this.farmService.farmExistsByNameAndPostcode(
      farmName,
      postcode,
    );
    return { exists };
  }

  @Get('/:farmId')
  async getFarmById(@Param('farmId', ParseIntPipe) farmId: number) {
    const { records } = await this.farmService.getById(farmId);
    return { Farm: records };
  }

  @Post('/')
  @ApiBody({ type: CreateFarmRequest })
  async createFarm(
    @Body('UserID', ParseIntPipe) UserID: number,
    @Body('RoleID', ParseIntPipe) RoleID: number,
    @Body('Farm') farmBody: FarmEntity,
  ) {
    const exists = await this.farmService.farmExistsByNameAndPostcode(
      farmBody.Name,
      farmBody.Postcode,
    );
    if (exists)
      throw new BadRequestException(
        'Farm already exists with this Name and Postcode',
      );
    const Farm = await this.userFarmsService.createFarm(
      farmBody,
      UserID,
      RoleID,
    );
    return { Farm };
  }
}
