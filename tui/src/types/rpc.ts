import { z } from "zod";

const serviceErrorSchema = z.object({
  message: z.string(),
});

const serviceSuccessSchema = z.object({
  payload: z.record(z.unknown()),
  error: z.null(),
});

const serviceFailureSchema = z.object({
  payload: z.null(),
  error: serviceErrorSchema,
});

const serviceResultSchema = z.union([serviceSuccessSchema, serviceFailureSchema]);

const rpcResponseSchema = z.object({
  id: z.number(),
  result: serviceResultSchema,
});

const rpcNotificationSchema = z.object({
  method: z.string(),
  params: z.record(z.unknown()),
});

const rpcMessageSchema = z.union([rpcResponseSchema, rpcNotificationSchema]);

export function parseRpcMessage(data: unknown): RpcMessage {
  return rpcMessageSchema.parse(data);
}

export type ServiceError = z.infer<typeof serviceErrorSchema>;
export type ServiceSuccess = z.infer<typeof serviceSuccessSchema>;
export type ServiceFailure = z.infer<typeof serviceFailureSchema>;
export type ServiceResult = z.infer<typeof serviceResultSchema>;
export type RpcResponse = z.infer<typeof rpcResponseSchema>;
export type RpcNotification = z.infer<typeof rpcNotificationSchema>;
export type RpcMessage = z.infer<typeof rpcMessageSchema>;

export type NotificationHandler = (
  method: string,
  params: Record<string, unknown>,
) => void;
