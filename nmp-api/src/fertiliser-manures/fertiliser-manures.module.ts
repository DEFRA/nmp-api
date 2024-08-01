import { Module } from '@nestjs/common';
import { FertiliserManuresController } from './fertiliser-manures.controller';
import { FertiliserManuresService } from './fertiliser-manures.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FertiliserManuresEntity } from '@db/entity/fertiliser-manures.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FertiliserManuresEntity])],
  controllers: [FertiliserManuresController],
  providers: [FertiliserManuresService],
  exports: [TypeOrmModule],
})
export class FertiliserManuresModule {}
