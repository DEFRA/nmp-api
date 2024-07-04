import {
  BadRequestException,
  Body,
  Controller,
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
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { FarmService } from './farm.service';
import FarmEntity from '@db/entity/farm.entity';
import { CreateFarmRequest, UpdateFarmRequest } from './dto/farm.dto';

@ApiTags('Farm')
@ApiSecurity('Bearer')
@Controller('farms')
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

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
  async createFarm(@Body('Farm') farmBody: FarmEntity, @Req() req: Request) {
    const exists = await this.farmService.farmExistsByNameAndPostcode(
      farmBody.Name,
      farmBody.Postcode,
    );
    if (exists)
      throw new BadRequestException(
        'Farm already exists with this Name and Postcode',
      );
    const userId = req['userId'];
    const Farm = await this.farmService.createFarm(farmBody, userId);
    return { Farm };
  }

  @Put('/:farmId')
  @ApiOperation({ summary: 'Update Farm by FarmId' })
  @ApiBody({ type: UpdateFarmRequest })
  async updateFarm(
    @Body('Farm') farmBody: FarmEntity,
    @Param('farmId', ParseIntPipe) farmId: number,
    @Req() req: Request,
  ) {
    const farm = await this.farmService.getFarm(
      farmBody.Name,
      farmBody.Postcode,
    );
    if (farm && farm.ID !== farmId)
      throw new BadRequestException(
        'Other farms also exists with this Name and Postcode',
      );
    const userId = req['userId'];
    const Farm = await this.farmService.updateFarm(farmBody, userId, farmId);
    return { Farm };
  }

  @Get('organisations/:organisationId')
  @ApiOperation({ summary: 'Get Farms by Organisation Id' })
  @ApiQuery({ name: 'shortSummary', required: false })
  async getFarmsByOrganisationId(
    @Param('organisationId') organisationId: string,
    @Query('shortSummary', new ParseBoolPipe({ optional: true }))
    shortSummary: boolean = false,
  ) {
    let selectOptions: any = {};
    if (shortSummary)
      selectOptions = { ID: true, Name: true, OrganisationID: true };
    const { records } = await this.farmService.getBy(
      'OrganisationID',
      organisationId,
      selectOptions,
    );
    return { Farms: records };
  }
}
