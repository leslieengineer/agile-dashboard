import { z } from 'zod'

export const IdOrNameSchema = z.union([
  z.number().int().nonnegative().max(0xffff_ffff),
  z.string().min(1).max(64),
])

export const NodeIdSchema = z.union([
  z.number().int().positive().safe(),
  z.string().regex(/^(?:0x)?[0-9a-fA-F]{1,16}$/),
])

export const CommandRequestSchema = z
  .object({
    request_id: z.string().uuid(),
    node_id: NodeIdSchema,
    endpoint: z.number().int().nonnegative().max(0xffff),
    cluster: IdOrNameSchema,
    command: IdOrNameSchema,
    payload: z.record(z.unknown()).default({}),
  })
  .strict()

export const ErrorCodeSchema = z.enum([
  'INVALID_ENVELOPE',
  'UNKNOWN_CLUSTER',
  'UNKNOWN_COMMAND',
  'INVALID_PAYLOAD',
  'NODE_UNKNOWN',
  'NODE_UNREACHABLE',
  'TIMEOUT',
  'PAYLOAD_TOO_LARGE',
  'CONTROLLER_ERROR',
  'INTERNAL',
])

export const GatewayErrorSchema = z
  .object({
    code: ErrorCodeSchema,
    message: z.string(),
    details: z.unknown().optional(),
  })
  .strict()

const ResponseBaseSchema = z.object({
  request_id: z.string().uuid().nullable(),
  node_id: z.string().nullable(),
  endpoint: z.number().int().nonnegative().nullable(),
  cluster: z.number().int().nonnegative().nullable(),
  command: z.number().int().nonnegative().nullable(),
  latency_ms: z.number().nonnegative(),
  timestamp: z.string().datetime(),
})

export const CommandResponseSchema = z.discriminatedUnion('status', [
  ResponseBaseSchema.extend({
    status: z.literal('ok'),
    result: z.unknown(),
  }).strict(),
  ResponseBaseSchema.extend({
    status: z.literal('error'),
    error: GatewayErrorSchema,
  }).strict(),
])

export const MatterEventSchema = z
  .object({
    type: z.literal('event'),
    request_id: z.null(),
    node_id: z.string(),
    endpoint: z.number().int().nonnegative(),
    cluster: z.number().int().nonnegative(),
    attributes: z.record(z.unknown()),
    timestamp: z.string().datetime(),
  })
  .strict()

export type CommandRequest = z.infer<typeof CommandRequestSchema>
export type CommandResponse = z.infer<typeof CommandResponseSchema>
export type GatewayErrorCode = z.infer<typeof ErrorCodeSchema>
export type MatterEvent = z.infer<typeof MatterEventSchema>

export interface NormalizedCommand {
  request_id: string
  node_id: string
  endpoint: number
  cluster: number
  command: number
  payload: Record<string, unknown>
}

export function normalizeNodeId(value: string | number): string {
  const numeric = typeof value === 'number' ? BigInt(value) : BigInt(value.startsWith('0x') ? value : `0x${value}`)
  return `0x${numeric.toString(16).padStart(16, '0')}`
}
