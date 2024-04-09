import { Column, Entity, JoinColumn, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
import OrderEntity from './order.entity';
// implements ICustomerContract
@Entity('Customers')
export default class CustomerEntity {
  @PrimaryGeneratedColumn()
  @PrimaryColumn({ name: 'CustomerID' })
  customerID: string;

  @Column()
  companyName: string;

  @Column()
  contactName: string;

  @Column()
  contactTitle: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  region: string;

  @Column()
  postalCode: string;

  @Column()
  country: string;

  @Column()
  phone: string;

  @Column()
  fax: string;

  @OneToMany(() => OrderEntity, (o) => o.customer)
  @JoinColumn({ name: 'CustomerID' })
  orders: OrderEntity[];
}
