export default interface ReadContract<ResponseType> {
  getAll(): Promise<ResponseType>;
  getById(id: number): Promise<ResponseType>;
  getBy(
    column: string,
    value: string | number,
    selectOptions: any,
  ): Promise<ResponseType>;
  search(
    columns: string,
    value: string,
    page: number,
    pageSize: number,
  ): Promise<ResponseType>;
  recordExists(whereOptions: any): Promise<boolean>;
  countRecords(whereOptions: any): Promise<number>;
}
