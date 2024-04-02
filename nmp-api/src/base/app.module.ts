import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseController } from './app.controller';
import { BaseService } from './base.service';

@Module({
  //imports: [TypeOrmModule.forFeature([])],
  controllers: [BaseController],
  providers: [BaseService],
  exports: [TypeOrmModule],
})
export class BaseModule {}
