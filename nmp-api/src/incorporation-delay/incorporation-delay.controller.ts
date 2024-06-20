import { Controller, Get, Param, Query } from '@nestjs/common';
import { IncorporationDelaysService } from './incorporation-delay.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Incorporation Delays')
@Controller('incorporation-delays')
@ApiSecurity('Bearer')
export class IncorporationDelaysController {
  constructor(
    private readonly incorporationDelaysService: IncorporationDelaysService,
  ) {}

  @Get('/:methodId')
  @ApiOperation({
    summary: 'Get list of Incorporation Delays',
  })
  async getIncorporationDelays(
    @Param('methodId') methodId: number,
    @Query('applicableFor') applicableFor: string,
  ) {
    const delays = await this.incorporationDelaysService.getIncorporationDelays(
      methodId,
      applicableFor,
    );

    return { IncorporationDelays: delays };
  }
}
