import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { MasterController } from './customer/master/master.controller';
// import { MasterModule } from './customer/master/master.module';
// import { MasterService } from './customer/master/master.service';

import OrmConnectionSetup from './app.orm';
import { RB209Controller } from './vendors/rb209/rb209.controller';
import { RB209Service } from './vendors/rb209/rb209.service';
import { AddressLookupController } from './vendors/address-lookup/address-lookup.controller';
import { AddressLookupService } from './vendors/address-lookup/address-lookup.service';

import { FarmController } from './farm/farm.controller';
import { FarmService } from './farm/farm.service';
import { FarmModule } from './farm/farm.module';
// import { AuthModule } from './auth/auth.module';
// import { AuthController } from './auth/auth.controller';
// import { AuthService } from './auth/auth.service';
// import { JwtService } from '@nestjs/jwt';
import { UserFarmsService } from './user-farms/user-farms.service';

import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth/jwt.guard';
import { AddressLookupModule } from './vendors/address-lookup/address-lookup.module';

@Module({
  // imports: [TypeOrmModule.forRoot(connectionSetup), MasterModule],
  imports: [
    // PassportModule.register({ defaultStrategy: 'jwt' }),
    // JwtModule.register({
    //   secret: 'your_secret_key', // Replace with your actual secret key
    //   signOptions: { expiresIn: '1h' },
    // }),
    // JwtAuthModule,
    // DevtoolsModule.register({
    //   http: process.env.NODE_ENV !== 'production',
    //   port: 7524,
    // }),
    JwtModule.register({
      global: true,
      secret: 'your_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forRootAsync({ useFactory: async () => OrmConnectionSetup }),
    AddressLookupModule,
    FarmModule,
  ],
  controllers: [
    AppController,
    RB209Controller,
    AddressLookupController,
    FarmController,
  ],
  providers: [
    JwtAuthGuard,
    AppService,
    RB209Service,
    AddressLookupService,
    FarmService,
    UserFarmsService,
  ],
})
export class AppModule {
  //implements NestModule
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(AzureAuthMiddleware).forRoutes('*');
  // }
}
