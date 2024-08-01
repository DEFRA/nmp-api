export interface ApiDataResponseType<T> {
  records: T;
  settings?: ApiResponseSettingsType;
  validationResults?: ApiResponseValidationType;
}

export interface ApiResponseSettingsType {
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
  from?: number;
  to?: number;
  hasPreviousPage?: boolean | false;
  hasNextPage?: boolean | false;
}

export interface ApiResponseValidationType {
  isValid: boolean;
}

export interface ApiDataRequestType<T> {
  payload: T;
}
