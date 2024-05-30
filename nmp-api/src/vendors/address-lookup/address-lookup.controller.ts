import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { AddressLookupService } from './address-lookup.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Address Lookup')
@Controller('vendors/address-lookup')
@ApiBearerAuth('token')
export class AddressLookupController {
  constructor(private readonly service: AddressLookupService) {}

  @Get('/')
  async health() {
    return await this.service.check();
  }

  @Get('/addresses')
  @ApiOperation({ summary: 'Get Addresses by Postcode' })
  @ApiQuery({ name: 'offset', required: false })
  async getAddresses(
    @Query('postcode') postcode: string,
    @Query('offset', new ParseIntPipe({ optional: true })) offset: number = 0,
  ) {
    return await this.service.getAddressesByPostCode(postcode, offset);
  }
}
