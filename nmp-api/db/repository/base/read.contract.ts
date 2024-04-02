export default interface ReadContract<ResponseType> {
  getAll(): Promise<ResponseType>;
  getById(id: number): Promise<ResponseType>;
  getBy(column: string, value: string): Promise<ResponseType>;
  search(
    columns: string,
    value: string,
    page: number,
    pageSize: number,
  ): Promise<ResponseType>;
  recordExists(column: string, value: any): Promise<boolean>;
}
