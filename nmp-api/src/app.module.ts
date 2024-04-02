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
    logging: true,
  };
}

@Module({
  //imports: [TypeOrmModule.forRoot(connectionSetup), MasterModule],
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: async () => connectionSetup }),
    MasterModule,
  ],
  controllers: [AppController, MasterController],
  providers: [AppService, MasterService],
})
export class AppModule {
  //implements NestModule
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(AzureAuthMiddleware).forRoutes('*');
  // }
}
