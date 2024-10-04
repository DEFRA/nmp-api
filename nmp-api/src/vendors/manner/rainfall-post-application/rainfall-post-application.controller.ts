import { Body, Controller, Post, Req } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { MannerRainfallPostApplicationService } from './rainfall-post-application.service';
import { CreateRainfallPostApplicationDto } from './dto/rainfall-post-application.dto';


@ApiTags('Manner rainfall-post-application')
@Controller('vendors/manner/rainfall-post-application')
@ApiSecurity('Bearer')
export class RainfallPostApplicationController {
  constructor(private readonly service: MannerRainfallPostApplicationService) {}

  @Post()
  @ApiOperation({
    summary: 'Calculate Rainfall Post Application of manure',
  })
  @ApiBody({ type: CreateRainfallPostApplicationDto, required: false })
  async calculateRainfallPostApplicationOfManure(
    @Body() body: CreateRainfallPostApplicationDto,
    @Req() req: Request,
  ) {
    const url = req.url.split('/manner')[1];
    return await this.service.postData(url, body);
  }
}
