import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import {
  CreateFarmRequest,
  UpdateFarmDto,
  UpdateFarmRequest,
} from './dto/farm.dto';

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
    @Query('Id', new ParseIntPipe({ optional: true })) id: number = 0,
  ) {
    const exists = await this.farmService.farmExistsByNameAndPostcode(
      farmName,
      postcode,
      id,
    );
    return { exists };
  }

  @Get('/:farmId')
  @ApiOperation({ summary: 'Get Farm details by Farm Id' })
  async getFarmById(@Param('farmId', ParseIntPipe) farmId: number) {
    const { records } = await this.farmService.getById(farmId);
    return { Farm: records };
  }

  @Post('/createFarm')
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

  @Put('/updateFarm')
  @ApiOperation({ summary: 'Update Farm api' })
  @ApiBody({ type: UpdateFarmRequest })
  async updateFarm(@Body('Farm') farmBody: UpdateFarmDto, @Req() req: Request) {
    const farm = await this.farmService.getFarm(
      farmBody.Name,
      farmBody.Postcode,
    );
    if (farm && farm.ID !== farmBody.ID)
      throw new BadRequestException(
        'Other farms also exists with this Name and Postcode',
      );
    const userId = req['userId'];
    const Farm = await this.farmService.updateFarm(
      farmBody,
      userId,
      farmBody.ID,
    );
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

  @Delete('/:farmId')
  @ApiOperation({ summary: 'Delete Farm by Farm Id' })
  async deleteFarmById(@Param('farmId', ParseIntPipe) farmId: number) {
    try {
      await this.farmService.deleteFarmAndRelatedEntities(farmId);
      return { message: 'Farm deleted successfully' };
    } catch (error) {
      console.error('Error deleting farm:', error);
      throw new NotFoundException(`Farm with ID ${farmId} not found`);
    }
  }
}
