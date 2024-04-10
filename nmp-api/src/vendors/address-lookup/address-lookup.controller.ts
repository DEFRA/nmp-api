import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { AddressLookupService } from './address-lookup.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Address Lookup')
@Controller('vendors/address-lookup')
export class AddressLookupController {
  constructor(private readonly service: AddressLookupService) {}

  @Get('/')
  async health() {
    return await this.service.check();
  }

  @Get('/addresses')
  async getAddresses(
    @Query('postcode') postcode: string,
    @Query('offset', ParseIntPipe) offset: number,
  ) {
    return await this.service.getAddressesByPostCode(postcode, offset);
  }
}
