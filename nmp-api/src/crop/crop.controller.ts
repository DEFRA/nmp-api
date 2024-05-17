import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CropService } from './crop.service';
import {
  CreateCropWithManagementPeriodsDto,
  CreatePlanDto,
} from './dto/crop.dto';
import { PlanService } from '@src/plan/plan.service';
import { StaticStrings } from '@shared/static.string';

@ApiTags('Crop')
@Controller('crops')
export class CropController {
  constructor(
    private readonly cropService: CropService,
    private readonly planService: PlanService,
  ) {}

  @Post('/fields/:fieldId')
  @ApiOperation({ summary: 'Create Crop by Field Id' })
  async createCrop(
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body() body: CreateCropWithManagementPeriodsDto,
  ) {
    const data = await this.cropService.createCropWithManagementPeriods(
      fieldId,
      body.Crop,
      body.ManagementPeriods,
    );
    return data;
  }

  @Get('/fields/:fieldId')
  @ApiOperation({ summary: 'Get Crops by Field Id' })
  async getCropsByFieldId(@Param('fieldId', ParseIntPipe) fieldId: number) {
    const Crops = await this.cropService.getBy('FieldID', fieldId);
    return { Crops };
  }

  @Post('/plans')
  @ApiOperation({ summary: 'Create Crop Plan' })
  async createNutrientsRecommendationForFieldByFieldId(
    @Body() body: CreatePlanDto,
  ) {
    const data = await this.planService.createNutrientsRecommendationForField(
      body.Crops,
    );
    return data;
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get Crop plans by farmId' })
  @ApiQuery({
    name: 'type',
    description: '0 for Plan, 1 for Record',
  })
  async getCropsPlansByFarmId(
    @Query('farmId', new ParseIntPipe({ optional: false })) farmId: number,
    @Query('type', new ParseIntPipe({ optional: false })) type: number,
  ) {
    if (!farmId || type === undefined) {
      throw new HttpException(
        StaticStrings.ERR_MISSING_PARAMETERS,
        HttpStatus.BAD_REQUEST,
      );
    }
    const confirm = !!type;
    return await this.planService.getPlans(farmId, confirm);
  }

  @Get('plans/:harvestYear')
  @ApiOperation({ summary: 'Get Crop plans by harvest year' })
  async getCropsPlansByHarvestYear(
    @Param('harvestYear', ParseIntPipe) harvestYear: number,
    @Query('farmId', new ParseIntPipe({ optional: false })) farmId: number,
  ) {
    if (!harvestYear || !farmId) {
      throw new HttpException(
        StaticStrings.ERR_MISSING_PARAMETERS,
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.planService.getPlansByHarvestYear(farmId, harvestYear);
  }
}
