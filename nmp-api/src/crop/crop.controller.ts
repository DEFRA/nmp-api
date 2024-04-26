import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
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
}
