import { Module } from '@nestjs/common';
import { WindspeedController } from './windspeed.controller';
import { WindspeedService } from './windspeed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WindspeedEntity } from '@db/entity/wind-speed.entity';
import { MannerWindspeedService } from '@src/vendors/manner/windspeed/windspeed.service';

@Module({
  imports: [TypeOrmModule.forFeature([WindspeedEntity])],
  controllers: [WindspeedController],
  providers: [WindspeedService, MannerWindspeedService],
  exports: [TypeOrmModule],
})
export class WindspeedModule {}
