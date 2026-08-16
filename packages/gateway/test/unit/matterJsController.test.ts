import { randomUUID } from 'node:crypto'
import { createServer, type Server } from 'node:net'
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
    expect(calls).toEqual(['health', 'invoke'])
  })
})
