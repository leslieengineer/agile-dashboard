import { describe, expect, it } from 'vitest'
import {
  CLUSTERS,
  CommandRequestSchema,
  MobileLoginResponseSchema,
  MobileSessionInfoSchema,
  MoveToLevelPayloadSchema,
  normalizeNodeId,
  resolveClusterId,
  resolveCommandId,
} from '../src/index.js'

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
