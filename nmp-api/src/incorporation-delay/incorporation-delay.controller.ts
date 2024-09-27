import {
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { IncorporationDelaysService } from './incorporation-delay.service';
import { ApiOperation, ApiParam, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Incorporation Delays')
@Controller('incorporation-delays')
@ApiSecurity('Bearer')
export class IncorporationDelaysController {
  constructor(
    private readonly incorporationDelaysService: IncorporationDelaysService,
  ) {}

  @Get('incorporation-methods/:methodId')
  @ApiOperation({
    summary: 'Get list of Incorporation Delays by Incorporation Method Id',
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

  // @Get(':id')
  // @ApiOperation({
  //   summary: 'Get Incorporation Delay by ID',
  // })
  // @ApiParam({ name: 'id', description: 'Incorporation Delay ID' })
  // async getIncorporationDelayById(@Param('id', ParseIntPipe) id: number) {
  //   const { records } = await this.incorporationDelaysService.getById(id);

  //   if (!records) {
  //     throw new NotFoundException(
  //       `Incorporation Delay with ID ${id} not found`,
  //     );
  //   }
  //   return { IncorporationDelay: records };
  // }
}
