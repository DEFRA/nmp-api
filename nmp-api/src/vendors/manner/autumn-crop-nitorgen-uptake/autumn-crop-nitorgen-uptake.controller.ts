import { Body, Controller, Post, Req } from '@nestjs/common';
import { MannerAutumnCropNitorgenUptakeService } from './autumn-crop-nitorgen-uptake.service';
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateAutumnCropUptakeNitrogenDto } from './dto/autumn-crop-nitrogen-uptake.dto';


@ApiTags('Manner autumn-crop-nitorgen-uptake')
@Controller('vendors/manner/autumn-crop-nitrogen-uptake')
@ApiSecurity('Bearer')
export class MannerAutumnCropNitorgenUptakeController {
  constructor(
    private readonly service: MannerAutumnCropNitorgenUptakeService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Get Autumn Crop Nitrogen Uptake',
  })
  @ApiBody({ type: CreateAutumnCropUptakeNitrogenDto, required: false })
  async calculateNutrients(
    @Body() body: CreateAutumnCropUptakeNitrogenDto,
    @Req() req: Request,
  ) {
    const url = req.url.split('/manner')[1];
    return await this.service.postData(url, body);
  }
}
