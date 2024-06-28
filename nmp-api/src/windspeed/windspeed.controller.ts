import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { WindspeedService } from './windspeed.service';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('Windspeed')
@Controller('windspeeds')
@ApiSecurity('Bearer')
export class WindspeedController {
  constructor(private readonly windspeedService: WindspeedService) {}
   
  @Get()
  @ApiOperation({ summary: 'Get all windspeeds data' })
  findAll() {
    return this.windspeedService.findAll();
  }

  @Get('default')
  findFirstRow() {
    return this.windspeedService.findFirstRow();
  }
}
