import IBaseContract from './base.contract';

export default interface IOrderContract extends IBaseContract {
  OrderID: number;
  CustomerID: string;
  EmployeeID: number;
  OrderDate: string;
  RequiredDate: Date;
  ShippedDate: Date;
  ShipVia: number;
  Freight: string;
  ShipName: string;
  ShipAddress: string;
  ShipCity: string;
  ShipRegion: string;
  ShipPostalCode: string;
  ShipCountry: string;
}
