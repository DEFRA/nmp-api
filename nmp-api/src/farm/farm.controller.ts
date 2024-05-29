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
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
//import { UserFarmService } from '@src/user-farm/user-farm.service';
import { FarmService } from './farm.service';
import FarmEntity from '@db/entity/farm.entity';
import { CreateFarmRequest } from './dto/farm.dto';

@ApiTags('Farm')
@Controller('farms')
export class FarmController {
  constructor(
    private readonly farmService: FarmService,
    //private readonly userFarmService: UserFarmService,
  ) {}

  // @Get('/users/:userId')
  // @ApiOperation({ summary: 'Get Farms by User Id' })
  // @ApiQuery({ name: 'shortSummary', required: false })
  // async getFarmsByUserId(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Query('shortSummary', new ParseBoolPipe({ optional: true }))
  //   shortSummary: boolean,
  // ) {
  //   const Farms = await this.userFarmService.getUserFarms(userId, shortSummary);
  //   return { Farms };
  // }

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
  async createFarm(@Body('Farm') farmBody: FarmEntity) {
    const exists = await this.farmService.farmExistsByNameAndPostcode(
      farmBody.Name,
      farmBody.Postcode,
    );
    if (exists)
      throw new BadRequestException(
        'Farm already exists with this Name and Postcode',
      );
    const Farm = await this.farmService.createFarm(farmBody);
    return { Farm };
  }

  @Get('organisations/:organisationId')
  @ApiOperation({ summary: 'Get Farms by Organisation Id' })
  async getFarmsByOrganisationId(
    @Param('organisationId') organisationId: string,
  ) {
    const { records } = await this.farmService.getBy(
      'OrganisationID',
      organisationId,
    );
    return { Farms: records };
  }
}
