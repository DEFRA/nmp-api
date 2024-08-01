// rain-type.controller.ts
import { Controller, Get } from '@nestjs/common';
import { RainTypeService } from './rain-type.service';
import { RainTypeEntity } from '@db/entity/rain-type.entity';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Raintypes')
@Controller('rain-types')
@ApiSecurity('Bearer')
export class RainTypeController {
  constructor(private readonly rainTypeService: RainTypeService) {}

  @Get('default')
  async findFirstRow(): Promise<RainTypeEntity> {
    return this.rainTypeService.findFirstRow();
  }

  @Get()
  @ApiOperation({ summary: 'Get all RainTypes data' })
  async findAll(){
    const { records } = await this.rainTypeService.getAll();
    return { RainTypes: records } as any;
  }
}
