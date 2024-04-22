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
import { RB209RainfallModule } from './vendors/rb209/rainfall/rainfall.module';
import { RB209RainfallController } from './vendors/rb209/rainfall/rainfall.controller';
import { RB209RainfallService } from './vendors/rb209/rainfall/rainfall.service';
import { RB209MeasurementModule } from './vendors/rb209/measurement/measurement.module';
import { RB209MeasurementController } from './vendors/rb209/measurement/measurement.controller';
import { RB209MeasurementService } from './vendors/rb209/measurement/measurement.service';
import { RB209RecommendationModule } from './vendors/rb209/recommendation/recommendation.module';
import { RB209RecommendationController } from './vendors/rb209/recommendation/recommendation.controller';
import { RB209RecommendationService } from './vendors/rb209/recommendation/recommendation.service';
import { RB209AdviceNoteModule } from './vendors/rb209/adviceNote/adviceNote.module';
import { RB209AdviceNoteController } from './vendors/rb209/adviceNote/adviceNote.controller';
import { RB209AdviceNoteService } from './vendors/rb209/adviceNote/adviceNote.service';
import { RB209GrasslandModule } from './vendors/rb209/grassland/grassland.module';
import { RB209GrasslandController } from './vendors/rb209/grassland/grassland.controller';
import { RB209GrasslandService } from './vendors/rb209/grassland/grassland.service';

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
    RB209RainfallModule,
    RB209MeasurementModule,
    RB209RecommendationModule,
    RB209AdviceNoteModule,
    RB209GrasslandModule,
  ],
  controllers: [
    AppController,
    AddressLookupController,
    FarmController,
    FieldController,
    RB209SoilController,
    RB209ArableController,
    RB209FieldController,
    RB209RainfallController,
    RB209MeasurementController,
    RB209RecommendationController,
    RB209AdviceNoteController,
    RB209GrasslandController,
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
    RB209RainfallService,
    RB209MeasurementService,
    RB209RecommendationService,
    RB209AdviceNoteService,
    RB209GrasslandService,
  ],
})
export class AppModule {
  //implements NestModule
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(AzureAuthMiddleware).forRoutes('*');
  // }
}
