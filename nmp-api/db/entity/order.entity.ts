import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
// import IOrderContract from '../../../packages/nmp-contracts/order.contract';
// implements IOrderContract
import CustomerEntity from './customer.entity';

@Entity('Orders')
export default class OrderEntity {
  @PrimaryGeneratedColumn()
  OrderID: number;

  @Column()
  CustomerID: string;

  @Column()
  EmployeeID: number;

  @Column()
  OrderDate: string;

  @Column({ default: new Date() })
  RequiredDate: Date;

  @Column({ default: new Date() })
  ShippedDate: Date;

  @Column()
  ShipVia: number;

  @Column()
  Freight: string;

  @Column()
  ShipName: string;

  @Column()
  ShipAddress: string;

  @Column()
  ShipCity: string;

  @Column()
  ShipRegion: string;

  @Column()
  ShipPostalCode: string;

  @Column()
  ShipCountry: string;

  @ManyToOne(() => CustomerEntity)
  @JoinColumn()
  Customer: CustomerEntity;
}
