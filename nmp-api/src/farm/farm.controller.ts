import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserFarmsService } from '@src/user-farms/user-farms.service';
import { FarmService } from './farm.service';
import FarmEntity from '@db/entity/farm.entity';
import { CreateFarmRequest } from './dto/farm.dto';

@ApiTags('Farm')
@Controller('farms')
export class FarmController {
  constructor(
    private readonly farmService: FarmService,
    private readonly userFarmsService: UserFarmsService,
  ) {}

  @Get('/users/:userId')
  @ApiOperation({ summary: 'Get Farms by User Id' })
  @ApiQuery({ name: 'shortSummary', required: false })
  async getFarmsByUserId(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('shortSummary', new ParseBoolPipe({ optional: true }))
    shortSummary: boolean,
  ) {
    const Farms = await this.userFarmsService.getUserFarms(
      userId,
      shortSummary,
    );
    return { Farms };
  }

  @Get('/exists')
  @ApiOperation({
    summary: 'Api to check Farm exists using Name and Postcode ',
  })
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
  @ApiOperation({ summary: 'Get Farm details by Farm Id' })
  async getFarmById(@Param('farmId', ParseIntPipe) farmId: number) {
    const { records } = await this.farmService.getById(farmId);
    return { Farm: records };
  }

  @Post('/')
  @ApiOperation({ summary: 'Create Farm api' })
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
