import pino from 'pino'
import { describe, expect, it } from 'vitest'
import { createCommandRegistry } from '../../src/clusters/index.js'
import { MockMatterController } from '../../src/controller/MockMatterController.js'
import { createDispatcher } from '../../src/mqtt/dispatcher.js'

function setup(latencyMs = 0, timeoutMs = 100) {
  const published: string[] = []
  const dispatch = createDispatcher({
    registry: createCommandRegistry(),
    controller: new MockMatterController(latencyMs),
    timeoutMs,
    rxTopic: 'home/control/rx',
    publish: async (_topic, payload) => {
      published.push(payload)
    },
    logger: pino({ level: 'silent' }),
  })
  return { dispatch, published }
}

const validRequest = {
  request_id: '11111111-1111-4111-8111-111111111111',
  node_id: '1',
  endpoint: 1,
  cluster: 'OnOff',
  command: 'On',
  payload: {},
}

describe('MQTT dispatcher', () => {
  it('correlates a valid response', async () => {
    const { dispatch, published } = setup()
    const response = await dispatch(Buffer.from(JSON.stringify(validRequest)))
    expect(response.status).toBe('ok')
    expect(response.request_id).toBe(validRequest.request_id)
    expect(published).toHaveLength(1)
  })

  it('returns typed errors for malformed JSON and invalid payloads', async () => {
    const malformed = await setup().dispatch(Buffer.from('not-json'))
    expect(malformed.status).toBe('error')
    if (malformed.status === 'error') expect(malformed.error.code).toBe('INVALID_ENVELOPE')

    const invalid = await setup().dispatch(
      Buffer.from(
        JSON.stringify({ ...validRequest, cluster: 'LevelControl', command: 'MoveToLevel', payload: { level: 255 } }),
      ),
    )
    expect(invalid.status).toBe('error')
    if (invalid.status === 'error') expect(invalid.error.code).toBe('INVALID_PAYLOAD')
  })

  it('times out a slow controller', async () => {
    const response = await setup(50, 1).dispatch(Buffer.from(JSON.stringify(validRequest)))
    expect(response.status).toBe('error')
    if (response.status === 'error') expect(response.error.code).toBe('TIMEOUT')
  })
})
