import CustomerEntity from '@db/entity/customer.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { DeepPartial } from 'typeorm';
import { MasterService } from './master.service';

@Controller('customer/master')
export class MasterController {
  constructor(private readonly service: MasterService) {}

  @Get('/get')
  async getAll() {
    return await this.service.getAll();
  }

  @Get('/get/:columnName/:value')
  async getBy(
    @Param('columnName') columnName: string,
    @Param('value') value: string,
  ) {
    return await this.service.getBy(columnName, value);
  }

  @Get('/get/:id')
  async getById(@Param('id', ParseIntPipe) Id: number) {
    return await this.service.getById(Id);
  }

  @Get('/search/:columns/:value/:page?/:size?')
  async search(
    @Param('columns') columns: string,
    @Param('value') value: string,
    @Param('page') page: number = 1,
    @Param('size') size: number = 10,
  ) {
    return await this.service.search(columns, value, page, size);
  }

  @Post('/save')
  async save(@Body() entity: DeepPartial<CustomerEntity>) {
    return await this.service.save(entity);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: number) {
    return await this.service.delete(id);
  }

  @Post('/save-multiple-transaction')
  async saveMultipleWithTransaction(
    @Body() entities: DeepPartial<CustomerEntity>[],
  ) {
    return await this.service.saveMultipleWithTransaction(entities);
  }

  @Get('/record-exists/:column/:value')
  async recordExists(
    @Param('column') column: string,
    @Param('value') value: any,
  ) {
    return await this.service.recordExists({ [column]: value });
  }

  @Post('/execute-query')
  async executeQuery(
    @Body('query') query: string,
    @Body('parameters') parameters?: any[],
  ) {
    return await this.service.executeQuery(query, parameters);
  }

  @Get('/join')
  async getJoinData() {
    return await this.service.getJoinData();
  }
}
