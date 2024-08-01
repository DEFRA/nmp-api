import CustomerEntity from '@db/entity/customer.entity';
import OrderEntity from '@db/entity/order.entity';

export default class MixedView extends CustomerEntity {
  orders: OrderEntity[];
}
