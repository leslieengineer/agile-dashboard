import { describe, expect, it } from 'vitest'
import { CLUSTERS, COMMANDS, type NormalizedCommand } from '@agile/contracts'
import { createCommandRegistry } from '../../src/clusters/index.js'
import { MockMatterController } from '../../src/controller/MockMatterController.js'
import { GatewayError } from '../../src/errors.js'

describe('gateway registry and mock controller', () => {
  it('distinguishes unknown clusters and commands', () => {
    const registry = createCommandRegistry()
    expect(() => registry.resolve(0xffff, 1)).toThrowError(GatewayError)
    expect(() => registry.resolve(CLUSTERS.OnOff, 0xff)).toThrowError(GatewayError)
  })

  it('updates mock OnOff state and emits an event', async () => {
    const controller = new MockMatterController(0)
    const events: unknown[] = []
    controller.on('event', (event) => events.push(event))
    const command: NormalizedCommand = {
      request_id: '11111111-1111-4111-8111-111111111111',
      node_id: '0x0000000000000001',
      endpoint: 1,
      cluster: CLUSTERS.OnOff,
      command: COMMANDS[CLUSTERS.OnOff].On,
      payload: {},
    }

    await expect(controller.invoke(command, { timeoutMs: 100 })).resolves.toEqual({
      attributes: { OnOff: true },
    })
    expect(events).toHaveLength(1)
  })
})
