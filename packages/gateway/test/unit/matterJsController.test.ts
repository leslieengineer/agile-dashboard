import { randomUUID } from 'node:crypto'
import { createServer, type Server, type Socket } from 'node:net'
import { afterEach, describe, expect, it } from 'vitest'
import type { NormalizedCommand } from '@agile/contracts'
import { MatterJsController } from '../../src/controller/MatterJsController.js'

const servers: Server[] = []
afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise<void>((resolve) => server.close(() => resolve()))))
})

async function mockControllerSocket(handler: (method: string, params: unknown) => unknown): Promise<string> {
  const path = `\\\\.\\pipe\\agile-matter-${randomUUID()}`
  const server = createServer((socket) => {
    socket.setEncoding('utf8')
    socket.on('data', (data) => {
      const request = JSON.parse(data.trim()) as { id: string; method: string; params: unknown }
      socket.write(`${JSON.stringify({ id: request.id, result: handler(request.method, request.params) })}\n`)
    })
  })
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(path, resolve)
  })
  servers.push(server)
  return path
}

async function mockEventControllerSocket(): Promise<{
  path: string
  waitForEventClient: Promise<void>
  notify: (value: boolean) => void
}> {
  const path = `\\\\.\\pipe\\agile-matter-event-${randomUUID()}`
  const clients = new Set<Socket>()
  let connectionCount = 0
  let eventClientReady: (() => void) | undefined
  const waitForEventClient = new Promise<void>((resolve) => { eventClientReady = resolve })
  const server = createServer((socket) => {
    connectionCount += 1
    if (connectionCount >= 2) eventClientReady?.()
    clients.add(socket)
    socket.once('close', () => clients.delete(socket))
    socket.on('error', () => clients.delete(socket))
    socket.setEncoding('utf8')
    socket.on('data', (data) => {
      const request = JSON.parse(data.trim()) as { id: string; method: string }
      socket.write(`${JSON.stringify({ id: request.id, result: { ready: true } })}\n`)
    })
  })
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(path, resolve)
  })
  servers.push(server)
  return {
    path,
    waitForEventClient,
    notify(value) {
      const notification = `${JSON.stringify({
        method: 'attributeChanged',
        params: { node_id: '0x0000000000000001', endpoint: 1, cluster: 6, attribute: 0, value },
      })}\n`
      for (const client of clients) if (!client.destroyed) client.write(notification)
    },
  }
}

describe('MatterJsController RPC adapter', () => {
  it('checks health and invokes a normalized Matter command', async () => {
    const calls: string[] = []
    const socketPath = await mockControllerSocket((method) => {
      calls.push(method)
      return method === 'health' ? { ready: true } : { accepted: true }
    })
    const controller = new MatterJsController(socketPath)
    await controller.start()
    const command: NormalizedCommand = {
      request_id: randomUUID(),
      node_id: '0x0000000000000001',
      endpoint: 1,
      cluster: 6,
      command: 1,
      payload: {},
    }
    await expect(controller.invoke(command, { timeoutMs: 1000 })).resolves.toEqual({ accepted: true })
    await expect(controller.read({ node_id: command.node_id, endpoint: 1, cluster: 6, attribute: 0 }, { timeoutMs: 0 }))
      .resolves.toEqual({ accepted: true })
    await expect(controller.subscribe(command.node_id, { timeoutMs: 1000 })).resolves.toEqual({ accepted: true })
    expect(calls).toEqual(['health', 'invoke', 'read', 'subscribe'])
    await controller.stop()
  })

  it('keeps a long-lived notification stream for Matter attribute reports', async () => {
    const mock = await mockEventControllerSocket()
    const controller = new MatterJsController(mock.path)
    const eventPromise = new Promise<Record<string, unknown>>((resolve) => {
      controller.on('event', (event) => resolve(event as unknown as Record<string, unknown>))
    })
    await controller.start()
    await mock.waitForEventClient
    mock.notify(true)
    await expect(eventPromise).resolves.toMatchObject({
      type: 'event',
      node_id: '0x0000000000000001',
      endpoint: 1,
      cluster: 6,
      attributes: { OnOff: true },
    })
    await controller.stop()
  })
})
