export interface ResponseFormat {
  message?: string;
  status: boolean;
  data: any;
  statusCode: number;
  timestamp: string;
  error?: ErrorFormat;
  totalRecords: number;
}

export interface ErrorFormat {
  message: string;
  code: number;
  stack?: any;
  path?: string;
}

export interface RequestFormat<Entity> {
  payload: Entity;
}
