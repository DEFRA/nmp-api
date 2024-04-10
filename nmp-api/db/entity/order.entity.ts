import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import CustomerEntity from './customer.entity';

@Entity('Orders')
export default class OrderEntity {
  @PrimaryGeneratedColumn()
  orderID: number;

  @Column({ name: 'CustomerID' })
  customerID: string;

  @Column()
  employeeID: number;

  @Column()
  orderDate: string;

  @Column({ default: new Date() })
  requiredDate: Date;

  @Column({ default: new Date() })
  shippedDate: Date;

  @Column()
  shipVia: number;

  @Column()
  freight: string;

  @Column()
  shipName: string;

  @Column()
  shipAddress: string;

  @Column()
  shipCity: string;

  @Column()
  shipRegion: string;

  @Column()
  shipPostalCode: string;

  @Column()
  shipCountry: string;

  @ManyToOne(() => CustomerEntity, (c) => c.orders)
  @JoinColumn({ name: 'CustomerID' })
  customer: CustomerEntity;
}
