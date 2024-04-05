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
import FarmEntity from '@db/entity/farm.entity';
import UserEntity from '@db/entity/user.entity';
import RoleEntity from '@db/entity/role.entity';
import UserFarmsEntity from '@db/entity/user-farms.entity';
import { FarmController } from './farm/farm.controller';
import { FarmService } from './farm/farm.service';
import { FarmModule } from './farm/farm.module';

let connectionSetup: TypeOrmModuleOptions = {};
if (process.env.NODE_ENV === 'production') {
  connectionSetup = {
    type: 'mssql',
    host: EnvironmentService.DATABASE_HOST(),
    port: EnvironmentService.DATABASE_PORT(),
    database: EnvironmentService.DATABASE_NAME(),
    username: EnvironmentService.DATABASE_USER(),
    password: EnvironmentService.DATABASE_PASSWORD(),
    entities: [
      CustomerEntity,
      OrderEntity,
      FarmEntity,
      UserEntity,
      RoleEntity,
      UserFarmsEntity,
    ],
  };
} else {
  connectionSetup = {
    type: 'mssql',
    host: EnvironmentService.DATABASE_HOST(),
    port: EnvironmentService.DATABASE_PORT(),
    database: EnvironmentService.DATABASE_NAME(),
    username: EnvironmentService.DATABASE_USER(),
    password: EnvironmentService.DATABASE_PASSWORD(),
    entities: [
      CustomerEntity,
      OrderEntity,
      FarmEntity,
      UserEntity,
      RoleEntity,
      UserFarmsEntity,
    ],
    options: { trustServerCertificate: true },
    logging: true,
  };
}

@Module({
  // imports: [TypeOrmModule.forRoot(connectionSetup), MasterModule],
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: async () => connectionSetup }),
    MasterModule,
    FarmModule,
  ],
  controllers: [
    AppController,
    MasterController,
    RB209Controller,
    AddressLookupController,
    FarmController,
  ],
  providers: [
    AppService,
    MasterService,
    FarmService,
    RB209Service,
    AddressLookupService,
  ],
})
export class AppModule {
  //implements NestModule
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(AzureAuthMiddleware).forRoutes('*');
  // }
}
