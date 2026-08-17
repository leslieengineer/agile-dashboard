import { z } from 'zod'
import { NodeIdSchema } from './envelope.js'

const Base64UrlSchema = z.string().min(8).max(4096).regex(/^[A-Za-z0-9_-]+$/)
const IsoDateSchema = z.string().datetime()

export const ProvisioningStateSchema = z.enum([
  'CREATED',
  'CLAIM_CHALLENGE',
  'CLAIM_VERIFIED',
  'GRANT_ISSUED',
  'PASE_ESTABLISHED',
  'ATTESTATION_VERIFIED',
  'THREAD_PROVISIONING',
  'THREAD_ATTACHING',
  'TEMP_FABRIC_COMMISSIONED',
  'WINDOW_OPEN',
  'BBB_FABRIC_COMMISSIONING',
  'ENDPOINT_DISCOVERY',
  'SUBSCRIBING',
  'TEMP_FABRIC_REMOVING',
  'CLEANUP_PENDING',
  'COMPLETE',
  'INVALID_DEVICE',
  'CLAIM_FAILED',
  'BLE_TIMEOUT',
  'PASE_FAILED',
  'ATTESTATION_FAILED',
  'THREAD_ATTACH_FAILED',
  'NODE_NOT_DISCOVERED',
  'BBB_COMMISSION_FAILED',
  'SUBSCRIPTION_FAILED',
  'TEMP_FABRIC_REMOVE_FAILED',
  'CANCELLED',
  'EXPIRED',
])

export const ProvisioningErrorCodeSchema = z.enum([
  'INVALID_DEVICE',
  'CLAIM_NOT_FOUND',
  'CLAIM_INVALID',
  'CLAIM_REPLAYED',
  'CLAIM_EXPIRED',
  'CLAIM_RATE_LIMITED',
  'TRANSACTION_CONFLICT',
  'TRANSACTION_NOT_FOUND',
  'TRANSACTION_STATE_INVALID',
  'THREAD_ATTACH_FAILED',
  'BBB_COMMISSION_FAILED',
  'NODE_NOT_FOUND',
  'SUBSCRIPTION_FAILED',
  'CLEANUP_REQUIRED',
  'INTERNAL',
])

export const ProvisioningErrorSchema = z.object({
  code: ProvisioningErrorCodeSchema,
  message: z.string().min(1).max(256),
  retryable: z.boolean().default(false),
}).strict()

export const CommissioningSessionCreateRequestSchema = z.object({
  claim_id: Base64UrlSchema.max(128),
  product_id: z.number().int().positive().max(0xffff),
  mobile_ephemeral_public_key: Base64UrlSchema.max(128),
}).strict()

export const CommissioningSessionCreateResponseSchema = z.object({
  transaction_id: z.string().uuid(),
  challenge: Base64UrlSchema.max(128),
  expires_at: IsoDateSchema,
  state: z.literal('CLAIM_CHALLENGE'),
}).strict()

export const ClaimProofRequestSchema = z.object({
  device_nonce: Base64UrlSchema.max(128),
  proof: Base64UrlSchema.max(128),
  ble_address_hint: z.string().min(1).max(64).optional(),
}).strict()

export const EncryptedCommissioningGrantSchema = z.object({
  version: z.literal(1),
  algorithm: z.literal('X25519-HKDF-SHA256-AES-256-GCM'),
  server_ephemeral_public_key: Base64UrlSchema.max(128),
  nonce: Base64UrlSchema.max(64),
  ciphertext: Base64UrlSchema,
  authentication_tag: Base64UrlSchema.max(64),
  transaction_id: z.string().uuid(),
  expires_at: IsoDateSchema,
}).strict()

export const ClaimProofResponseSchema = z.object({
  transaction_id: z.string().uuid(),
  state: z.literal('GRANT_ISSUED'),
  grant: EncryptedCommissioningGrantSchema,
}).strict()

export const ThreadAttachedRequestSchema = z.object({
  temporary_node_id: NodeIdSchema,
  attestation_verified: z.literal(true),
}).strict()

export const CommissioningWindowRequestSchema = z.object({
  temporary_node_id: NodeIdSchema,
  discriminator: z.number().int().nonnegative().max(4095),
  setup_passcode: z.number().int().positive().max(99_999_998),
  timeout_seconds: z.number().int().min(60).max(900),
  known_ipv6_address: z.string().max(64).optional(),
}).strict()

export const CommissioningCompleteRequestSchema = z.object({
  bbb_node_id: NodeIdSchema,
  temporary_fabric_removed: z.boolean(),
}).strict()

export const CommissioningSessionSchema = z.object({
  transaction_id: z.string().uuid(),
  claim_id: Base64UrlSchema.max(128),
  product_id: z.number().int().positive().max(0xffff),
  state: ProvisioningStateSchema,
  created_at: IsoDateSchema,
  expires_at: IsoDateSchema,
  temporary_node_id: z.string().optional(),
  bbb_node_id: z.string().optional(),
  error: ProvisioningErrorSchema.optional(),
}).strict()

export const DeviceEndpointSchema = z.object({
  endpoint: z.number().int().nonnegative().max(0xffff),
  device_types: z.array(z.number().int().nonnegative().max(0xffff_ffff)),
  server_clusters: z.array(z.number().int().nonnegative().max(0xffff_ffff)),
}).strict()

export const DeviceInventoryEntrySchema = z.object({
  node_id: z.string().regex(/^0x[0-9a-f]{16}$/),
  product_id: z.number().int().positive().max(0xffff),
  label: z.string().min(1).max(64),
  online: z.boolean(),
  commissioned_at: IsoDateSchema,
  endpoints: z.array(DeviceEndpointSchema),
}).strict()

export const CommissioningNotificationSchema = z.object({
  type: z.literal('provisioning'),
  transaction_id: z.string().uuid(),
  state: ProvisioningStateSchema,
  timestamp: IsoDateSchema,
  error: ProvisioningErrorSchema.optional(),
}).strict()

export type ProvisioningState = z.infer<typeof ProvisioningStateSchema>
export type CommissioningSessionCreateRequest = z.infer<typeof CommissioningSessionCreateRequestSchema>
export type CommissioningSessionCreateResponse = z.infer<typeof CommissioningSessionCreateResponseSchema>
export type ClaimProofRequest = z.infer<typeof ClaimProofRequestSchema>
export type ClaimProofResponse = z.infer<typeof ClaimProofResponseSchema>
export type EncryptedCommissioningGrant = z.infer<typeof EncryptedCommissioningGrantSchema>
export type CommissioningSession = z.infer<typeof CommissioningSessionSchema>
export type DeviceInventoryEntry = z.infer<typeof DeviceInventoryEntrySchema>
export type CommissioningNotification = z.infer<typeof CommissioningNotificationSchema>
