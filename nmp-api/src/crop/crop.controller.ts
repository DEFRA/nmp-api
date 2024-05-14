import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CropService } from './crop.service';
import {
  CreateCropWithManagementPeriodsDto,
  CreatePlanDto,
} from './dto/crop.dto';
import { PlanService } from '@src/plan/plan.service';

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
      body.fieldID,
      body.Crop,
      body.ManagementPeriods,
    );
    return data;
  }
}
