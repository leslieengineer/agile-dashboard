import { z } from 'zod'
import { CommandRequestSchema, CommandResponseSchema, MatterEventSchema } from './envelope.js'
import { CommissioningNotificationSchema, DeviceInventoryEntrySchema } from './provisioning.js'

export const CommandInputSchema = CommandRequestSchema.omit({ request_id: true }).strict()
export const LoginRequestSchema = z.object({ username: z.string().min(1).max(64), password: z.string().min(8).max(256) }).strict()
export const SessionInfoSchema = z.object({ authenticated: z.literal(true), username: z.string(), csrf_token: z.string(), expires_at: z.string().datetime() }).strict()
export const ApiErrorCodeSchema = z.enum(['UNAUTHENTICATED','INVALID_CREDENTIALS','CSRF_INVALID','FORBIDDEN_ORIGIN','RATE_LIMITED','BAD_REQUEST','PAYLOAD_TOO_LARGE','UPSTREAM_TIMEOUT','MQTT_UNAVAILABLE','INTERNAL'])
export const ApiErrorSchema = z.object({ code: ApiErrorCodeSchema, message: z.string(), retry_after_s: z.number().optional() }).strict()
export const SseEnvelopeSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('response'), data: CommandResponseSchema }).strict(),
  z.object({ type: z.literal('event'), data: MatterEventSchema }).strict(),
  z.object({ type: z.literal('status'), data: z.record(z.unknown()) }).strict(),
  z.object({ type: z.literal('snapshot'), data: z.object({ devices: z.array(DeviceInventoryEntrySchema) }).strict() }).strict(),
  CommissioningNotificationSchema,
])
export type CommandInput = z.infer<typeof CommandInputSchema>
export type SessionInfo = z.infer<typeof SessionInfoSchema>
export type SseEnvelope = z.infer<typeof SseEnvelopeSchema>
