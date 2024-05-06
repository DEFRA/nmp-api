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
import { CreateCropWithManagementPeriodsDto } from './dto/crop.dto';

@ApiTags('Crop')
@Controller('crop')
export class CropController {
  constructor(private readonly cropService: CropService) {}

  @Post('/field/:fieldId')
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

  @Get('/field/:fieldId')
  @ApiOperation({ summary: 'Get Crops by Field Id' })
  async getCropsByFieldId(@Param('fieldId', ParseIntPipe) fieldId: number) {
    const Crops = await this.cropService.getBy('FieldID', fieldId);
    return { Crops };
  }
}
