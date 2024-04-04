import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MasterController } from './customer/master/master.controller';
import { MasterModule } from './customer/master/master.module';
import { MasterService } from './customer/master/master.service';

import OrmConnectionSetup from './app.orm';
import { RB209Controller } from './vendors/rb209/rb209.controller';
import { RB209Service } from './vendors/rb209/rb209.service';

import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth/jwt.guard';

@Module({
  //imports: [TypeOrmModule.forRoot(connectionSetup), MasterModule],
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
    MasterModule,
  ],
  controllers: [AppController, MasterController, RB209Controller],
  providers: [JwtAuthGuard, AppService, MasterService, RB209Service],
})
export class AppModule {
  //implements NestModule
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(AzureAuthMiddleware).forRoutes('*');
  // }
}
