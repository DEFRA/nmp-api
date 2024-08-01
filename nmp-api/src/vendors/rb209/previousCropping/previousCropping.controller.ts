import { Controller, Get, Param, Req } from '@nestjs/common';
import { RB209PreviousCroppingService } from './previousCropping.service';
import { ApiSecurity, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('RB209 PreviousCropping')
@ApiSecurity('Bearer')
@Controller('vendors/rb209/PreviousCropping')
export class RB209PreviousCroppingController {
  constructor(private readonly service: RB209PreviousCroppingService) {}

  @Get('/PreviousGrasses')
  @ApiOperation({ summary: 'The full list of available Previous Grasses' })
  async getPreviousGrasses(@Req() req: Request) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }

  @Get('/PreviousGrass/:previousGrassId')
  @ApiOperation({
    summary: 'Individual Previous Grass - filtered by Previous Grass Id',
  })
  async getPreviousGrassByPreviousGrassId(
    @Param('previousGrassId') previousGrassId: string,
    @Req() req: Request,
  ) {
    const url = req.url.split('/rb209')[1];
    return await this.service.getData(url);
  }
}
