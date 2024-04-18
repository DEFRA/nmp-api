import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { MasterController } from './customer/master/master.controller';
// import { MasterModule } from './customer/master/master.module';
// import { MasterService } from './customer/master/master.service';

import OrmConnectionSetup from './app.orm';
import { RB209SoilController } from './vendors/rb209/soil/soil.controller';
import { RB209SoilService } from './vendors/rb209/soil/soil.service';
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
import { FieldService } from './field/field.service';
import { FieldController } from './field/field.controller';
import { FieldModule } from './field/field.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RB209SoilModule } from './vendors/rb209/soil/soil.module';
import { RB209ArableModule } from './vendors/rb209/arable/arable.module';
import { RB209ArableController } from './vendors/rb209/arable/arable.controller';
import { RB209ArableService } from './vendors/rb209/arable/arable.service';
import { RB209FieldModule } from './vendors/rb209/field/field.module';
import { RB209FieldController } from './vendors/rb209/field/field.controller';
import { RB209FieldService } from './vendors/rb209/field/field.service';

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
    CacheModule.register({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: 'your_secret_key',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forRootAsync({ useFactory: async () => OrmConnectionSetup }),
    AddressLookupModule,
    FarmModule,
    FieldModule,
    RB209SoilModule,
    RB209ArableModule,
    RB209FieldModule,
  ],
  controllers: [
    AppController,
    AddressLookupController,
    FarmController,
    FieldController,
    RB209SoilController,
    RB209ArableController,
    RB209FieldController,
  ],
  providers: [
    JwtAuthGuard,
    AppService,
    AddressLookupService,
    FarmService,
    UserFarmsService,
    FieldService,
    RB209SoilService,
    RB209ArableService,
    RB209FieldService,
  ],
})
export class AppModule {
  //implements NestModule
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(AzureAuthMiddleware).forRoutes('*');
  // }
}
