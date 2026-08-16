import { createServer } from 'node:net'
import { createBroker } from 'aedes'
import { connectAsync } from 'mqtt'
import pino from 'pino'
import { afterEach, describe, expect, it } from 'vitest'
import { createCommandRegistry } from '../../src/clusters/index.js'
import { MockMatterController } from '../../src/controller/MockMatterController.js'
import { createDispatcher } from '../../src/mqtt/dispatcher.js'

const cleanup: Array<() => Promise<void>> = []
afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((close) => close()))
})

describe('MQTT bridge integration', () => {
  it('bridges TX to a correlated RX response through an authenticated broker', async () => {
    const broker = createBroker()
    broker.authenticate = (_client, username, password, callback) => {
      callback(null, username === 'test' && password?.toString() === 'secret')
    }
    const server = createServer(broker.handle)
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
    const address = server.address()
    if (!address || typeof address === 'string') throw new Error('Broker did not expose a TCP port')
    cleanup.push(async () => {
      await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())))
      await new Promise<void>((resolve, reject) => broker.close((error) => (error ? reject(error) : resolve())))
    })

    const url = `mqtt://127.0.0.1:${address.port}`
    const options = { username: 'test', password: 'secret' }
    const gateway = await connectAsync(url, { ...options, clientId: 'gateway-test' })
    const web = await connectAsync(url, { ...options, clientId: 'web-test' })
    cleanup.unshift(async () => {
      await Promise.all([gateway.endAsync(), web.endAsync()])
    })

    const dispatch = createDispatcher({
      registry: createCommandRegistry(),
      controller: new MockMatterController(0),
      timeoutMs: 100,
      rxTopic: 'home/control/rx',
      publish: async (topic, payload) => {
        await gateway.publishAsync(topic, payload, { qos: 1 })
      },
      logger: pino({ level: 'silent' }),
    })
    gateway.on('message', (_topic, payload) => void dispatch(payload))
    await gateway.subscribeAsync('home/control/tx', { qos: 1 })
    await web.subscribeAsync('home/control/rx', { qos: 1 })

    const response = new Promise<Record<string, unknown>>((resolve) => {
      web.once('message', (_topic, payload) => resolve(JSON.parse(payload.toString()) as Record<string, unknown>))
    })
    await web.publishAsync(
      'home/control/tx',
      JSON.stringify({
        request_id: '11111111-1111-4111-8111-111111111111',
        node_id: '1',
        endpoint: 1,
        cluster: 'OnOff',
        command: 'On',
        payload: {},
      }),
      { qos: 1 },
    )

    await expect(response).resolves.toMatchObject({
      request_id: '11111111-1111-4111-8111-111111111111',
      status: 'ok',
      cluster: 6,
      command: 1,
    })
  })
})
