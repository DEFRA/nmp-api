import { Controller, Get, Param } from '@nestjs/common';
import { IncorporationDelaysService } from './incorporation-delay.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Incorporation Delays')
@Controller('incorporation-delays')
@ApiSecurity('Bearer')
export class IncorporationDelaysController {
  constructor(
    private readonly incorporationDelaysService: IncorporationDelaysService,
  ) {}

  @Get(':methodId')
  @ApiOperation({
    summary: 'Get list of Incorporation Delays by Incorp Method Id',
  })
  async getDelaysByMethodId(@Param('methodId') methodId: number) {
    const delays =
      await this.incorporationDelaysService.getDelaysByMethodId(methodId);
    return delays?.map((delay) => ({
      ID: delay.ID,
      Name: delay.Name,
      FromHours: delay.FromHours,
      ToHours: delay.ToHours,
    }));
  
  }
}
