import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
// import { MasterModule } from './customer/master/master.module';

import OrmConnectionSetup from './app.orm';

import { FarmModule } from './farm/farm.module';
// import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { AddressLookupModule } from './vendors/address-lookup/address-lookup.module';
import { FieldModule } from './field/field.module';
import { CacheModule } from '@nestjs/cache-manager';
import { RB209SoilModule } from './vendors/rb209/soil/soil.module';
import { RB209ArableModule } from './vendors/rb209/arable/arable.module';
import { RB209FieldModule } from './vendors/rb209/field/field.module';
import { RB209RainfallModule } from './vendors/rb209/rainfall/rainfall.module';
import { RB209MeasurementModule } from './vendors/rb209/measurement/measurement.module';
import { RB209RecommendationModule } from './vendors/rb209/recommendation/recommendation.module';
import { RB209AdviceNoteModule } from './vendors/rb209/adviceNote/adviceNote.module';
import { RB209GrasslandModule } from './vendors/rb209/grassland/grassland.module';
import { RB209OrganicMateriaModule } from './vendors/rb209/organicMaterial/organicMaterial.module';
import { RB209PreviousCroppingModule } from './vendors/rb209/previousCropping/previousCropping.module';
import { CropModule } from './crop/crop.module';
import { SoilAnalysisModule } from './soil-analysis/soil-analysis.module';
import { ManagementPeriodModule } from './management-period/management-period.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { AzureAuthMiddleware } from 'middleware/azureAuth.middleware';
import { UserModule } from './user/user.module';
import { AzureAuthService } from 'middleware/azureAuth-service';
import { ClimateModule } from './climate/climate.module';
import { IncorporationMethodModule } from './incorporation-method/incorporation-method.module';

import { ManureTypeModule } from './manure-type/manure-type.module';
import { ManureGroupModule } from './manure-group/manure-group.module';
import { IncorporationDelaysModule } from './incorporation-delay/incorporation-delay.module';
import { ApplicationMethodModule } from './application-method/application-method.module';
import { OrganicManureModule } from './organic-manure/organic-manure.module';
import { WindspeedModule } from './windspeed/windspeed.module';

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
    CropModule,
    SoilAnalysisModule,
    ManagementPeriodModule,
    ClimateModule,
    RB209SoilModule,
    RB209ArableModule,
    RB209FieldModule,
    RB209RainfallModule,
    RB209MeasurementModule,
    RB209RecommendationModule,
    RB209AdviceNoteModule,
    RB209GrasslandModule,
    RB209OrganicMateriaModule,
    RB209PreviousCroppingModule,
    RecommendationModule,
    UserModule,
    IncorporationMethodModule,
    ManureTypeModule,
    ManureGroupModule,
    IncorporationDelaysModule,
    ApplicationMethodModule,
    OrganicManureModule,
    WindspeedModule,
  ],
  providers: [AzureAuthService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(AzureAuthMiddleware).forRoutes('*');
  }
}
