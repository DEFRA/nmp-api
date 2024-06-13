import { Module } from '@nestjs/common';
import { ApplicationMethodService } from './application-method.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationMethodController } from './application-method.controller';
import { ApplicationMethodEntity } from '@db/entity/application-method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationMethodEntity])],
  providers: [ApplicationMethodService],
  controllers: [ApplicationMethodController],
  exports: [TypeOrmModule],
})
export class ApplicationMethodModule {}
