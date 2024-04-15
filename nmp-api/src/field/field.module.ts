import FieldEntity from '@db/entity/field.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldController } from './field.controller';
import { FieldService } from './field.service';

@Module({
  imports: [TypeOrmModule.forFeature([FieldEntity])],
  controllers: [FieldController],
  providers: [FieldService],
  exports: [TypeOrmModule],
})
export class FieldModule {}
