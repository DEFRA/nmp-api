import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RB209Controller } from './rb209.controller';
import { RB209Service } from './rb209.service';

@Module({
  //imports: [TypeOrmModule.forFeature([CustomerEntity, OrderEntity])],
  controllers: [RB209Controller],
  providers: [RB209Service],
  exports: [TypeOrmModule],
})
export class RB209Module {}
