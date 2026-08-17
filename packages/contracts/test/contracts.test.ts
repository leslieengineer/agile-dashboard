import { describe, expect, it } from 'vitest'
import {
  CLUSTERS,
<<<<<<< HEAD
  ClaimProofRequestSchema,
  CommissioningSessionCreateRequestSchema,
  CommissioningWindowRequestSchema,
  EncryptedCommissioningGrantSchema,
=======
  CommandRequestSchema,
  MobileLoginResponseSchema,
  MobileSessionInfoSchema,
>>>>>>> 0b4bb7ca36fba1a222802515ec3128bac1cb9bf4
  MoveToLevelPayloadSchema,
  ProvisioningStateSchema,
  CommandRequestSchema,
  normalizeNodeId,
  resolveClusterId,
  resolveCommandId,
} from '../src/index.js'

describe('Provisioning contracts', () => {
  it('accepts a bounded commissioning request and encrypted grant', () => {
    expect(CommissioningSessionCreateRequestSchema.parse({
      claim_id: 'YWJjZGVmZ2g',
      product_id: 1,
      mobile_ephemeral_public_key: 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    }).product_id).toBe(1)

    expect(EncryptedCommissioningGrantSchema.parse({
      version: 1,
      algorithm: 'X25519-HKDF-SHA256-AES-256-GCM',
      server_ephemeral_public_key: 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
      nonce: 'CCCCCCCCCCCCCCCC',
      ciphertext: 'DDDDDDDDDDDDDDDD',
      authentication_tag: 'EEEEEEEEEEEEEEEEEEEEEE',
      transaction_id: '11111111-1111-4111-8111-111111111111',
      expires_at: '2026-08-16T12:00:00.000Z',
    }).version).toBe(1)
  })

  it('rejects malformed proofs and unsafe window values', () => {
    expect(() => ClaimProofRequestSchema.parse({ device_nonce: 'not base64!', proof: 'short' })).toThrow()
    expect(() => CommissioningWindowRequestSchema.parse({
      temporary_node_id: '1',
      discriminator: 4096,
      setup_passcode: 0,
      timeout_seconds: 5,
    })).toThrow()
  })

  it('defines recovery states explicitly', () => {
    expect(ProvisioningStateSchema.parse('CLEANUP_PENDING')).toBe('CLEANUP_PENDING')
    expect(() => ProvisioningStateSchema.parse('UNKNOWN')).toThrow()
  })
})

describe('Matter command contracts', () => {
  it('accepts and normalizes a valid Matter envelope', () => {
    const request = CommandRequestSchema.parse({
      request_id: '11111111-1111-4111-8111-111111111111',
      node_id: '1',
      endpoint: 1,
      cluster: 'OnOff',
      command: 'On',
      payload: {},
    })

    expect(normalizeNodeId(request.node_id)).toBe('0x0000000000000001')
    expect(resolveClusterId(request.cluster)).toBe(CLUSTERS.OnOff)
    expect(resolveCommandId(CLUSTERS.OnOff, request.command)).toBe(1)
  })

  it('preserves a full 64-bit node id represented as text', () => {
    expect(normalizeNodeId('FFFFFFFFFFFFFFFF')).toBe('0xffffffffffffffff')
  })

  it('validates mobile session responses without exposing CSRF', () => {
    expect(MobileLoginResponseSchema.parse({
      authenticated: true,
      username: 'admin',
      expires_at: '2026-08-17T00:00:00.000Z',
      token: 'a'.repeat(43),
    }).token).toHaveLength(43)
    expect(() => MobileSessionInfoSchema.parse({
      authenticated: true,
      username: 'admin',
      expires_at: '2026-08-17T00:00:00.000Z',
      csrf_token: 'not-allowed',
    })).toThrow()
  })

  it('rejects unknown envelope fields and invalid levels', () => {
    expect(() =>
      CommandRequestSchema.parse({
        request_id: '11111111-1111-4111-8111-111111111111',
        node_id: '1',
        endpoint: 1,
        cluster: 6,
        command: 1,
        payload: {},
        extra: true,
      }),
    ).toThrow()
    expect(() => MoveToLevelPayloadSchema.parse({ level: 255 })).toThrow()
  })
})
