import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MasterController } from './customer/master/master.controller';
import { MasterModule } from './customer/master/master.module';
import { MasterService } from './customer/master/master.service';

import CustomerEntity from '@db/entity/customer.entity';
import OrderEntity from '@db/entity/order.entity';
import * as dotven from 'dotenv';
dotven.config();

import EnvironmentService from '@shared/environment.service';
import { RB209Controller } from './vendors/rb209/rb209.controller';
import { RB209Service } from './vendors/rb209/rb209.service';
import { AddressLookupController } from './vendors/address-lookup/address-lookup.controller';
import { AddressLookupService } from './vendors/address-lookup/address-lookup.service';

let connectionSetup: TypeOrmModuleOptions = {};
if (process.env.NODE_ENV === 'production') {
  connectionSetup = {
    type: 'mssql',
    host: EnvironmentService.DATABASE_HOST(),
    port: EnvironmentService.DATABASE_PORT(),
    database: EnvironmentService.DATABASE_NAME(),
    username: EnvironmentService.DATABASE_USER(),
    password: EnvironmentService.DATABASE_PASSWORD(),
    entities: [CustomerEntity, OrderEntity],
  };
} else {
  connectionSetup = {
    type: 'mssql',
    host: EnvironmentService.DATABASE_HOST(),
    port: EnvironmentService.DATABASE_PORT(),
    database: EnvironmentService.DATABASE_NAME(),
    username: EnvironmentService.DATABASE_USER(),
    password: EnvironmentService.DATABASE_PASSWORD(),
    entities: [CustomerEntity, OrderEntity],
    options: { trustServerCertificate: true },
    logging: true,
  };
}

@Module({
  //imports: [TypeOrmModule.forRoot(connectionSetup), MasterModule],
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: async () => connectionSetup }),
    MasterModule,
  ],
  controllers: [
    AppController,
    MasterController,
    RB209Controller,
    AddressLookupController,
  ],
  providers: [AppService, MasterService, RB209Service, AddressLookupService],
})
export class AppModule {
  //implements NestModule
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(AzureAuthMiddleware).forRoutes('*');
  // }
}
