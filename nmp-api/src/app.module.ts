import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      entities: [CustomerEntity, OrderEntity],
    }),
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
