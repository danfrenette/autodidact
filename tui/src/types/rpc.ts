export type ServiceError = {
  message: string;
};

export type ServiceSuccess = {
  payload: Record<string, unknown>;
  error: null;
};

export type ServiceFailure = {
  payload: null;
  error: ServiceError;
};

export type ServiceResult = ServiceSuccess | ServiceFailure;

export type RpcResponse = {
  id: number;
  result: ServiceResult;
};

export type RpcNotification = {
  method: string;
  params: Record<string, unknown>;
};

export type RpcMessage = RpcResponse | RpcNotification;

export type NotificationHandler = (
  method: string,
  params: Record<string, unknown>,
) => void;
