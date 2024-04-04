import CustomerEntity from '@db/entity/customer.entity';
import OrderEntity from '@db/entity/order.entity';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import EnvironmentService from '@shared/environment.service';
import * as dotven from 'dotenv';
import 'dotenv/config';

dotven.config();
//console.log('ENV', process?.env);

let OrmConnectionSetup: TypeOrmModuleOptions = {};
if (process.env.NODE_ENV === 'production') {
  OrmConnectionSetup = {
    type: 'mssql',
    host: EnvironmentService.DATABASE_HOST(),
    port: EnvironmentService.DATABASE_PORT(),
    database: EnvironmentService.DATABASE_NAME(),
    username: EnvironmentService.DATABASE_USER(),
    password: EnvironmentService.DATABASE_PASSWORD(),
    entities: [CustomerEntity, OrderEntity],
  };
} else {
  OrmConnectionSetup = {
    type: 'mssql',
    host: EnvironmentService.DATABASE_HOST(),
    port: EnvironmentService.DATABASE_PORT(),
    database: EnvironmentService.DATABASE_NAME(),
    username: EnvironmentService.DATABASE_USER(),
    password: EnvironmentService.DATABASE_PASSWORD(),
    entities: [CustomerEntity, OrderEntity],
    logging: true,
  };
}

export default OrmConnectionSetup;
