import { Module } from '@nestjs/common';
import { WindspeedController } from './windspeed.controller';
import { WindspeedService } from './windspeed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WindspeedEntity } from '@db/entity/wind-speed.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WindspeedEntity])],
  controllers: [WindspeedController],
  providers: [WindspeedService],
  exports: [TypeOrmModule]
})
export class WindspeedModule {}
