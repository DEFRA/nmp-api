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
import CropEntity from '@db/entity/crop.entity';

@ApiTags('Crop')
@Controller('crop')
export class CropController {
  constructor(private readonly cropService: CropService) {}

  @Post('/field/:fieldId')
  @ApiOperation({ summary: 'Create Crop by Field Id' })
  async createCrop(
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body() body: CropEntity,
  ) {
    const Crop = await this.cropService.save({ ...body, FieldID: fieldId });
    return { Crop };
  }

  @Get('/field/:fieldId')
  @ApiOperation({ summary: 'Get Crops by Field Id' })
  async getCropsByFieldId(@Param('fieldId', ParseIntPipe) fieldId: number) {
    const Crop = await this.cropService.getBy('FieldID', fieldId);
    return { Crop };
  }
}
