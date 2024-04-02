import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';
// import ICustomerContract from '../../../packages/nmp-contracts/customer.contract';
// implements ICustomerContract
@Entity('Customers')
export default class CustomerEntity {
  @PrimaryGeneratedColumn()
  @PrimaryColumn()
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
}
