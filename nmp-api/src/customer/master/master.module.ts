import CustomerEntity from '@db/entity/customer.entity';
import OrderEntity from '@db/entity/order.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterController } from './master.controller';
import { MasterService } from './master.service';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity, OrderEntity])],
  controllers: [MasterController],
  providers: [MasterService],
  exports: [TypeOrmModule],
})
export class MasterModule {}
