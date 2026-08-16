import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { createConnection } from 'node:net'
import type { MatterEvent, NormalizedCommand } from '@agile/contracts'
import type { InvokeOptions, MatterController } from './MatterController.js'

interface RpcResponse {
  id: string
  result?: unknown
  error?: { code: string; message: string }
}

export class MatterJsController extends EventEmitter implements MatterController {
  readonly kind = 'matterjs' as const

  constructor(private readonly socketPath: string) {
    super()
  }

  override on(event: 'event', listener: (matterEvent: MatterEvent) => void): this {
    return super.on(event, listener)
  }

  async start(): Promise<void> {
    await this.call('health', undefined, 5000)
  }

  async stop(): Promise<void> {}

  invoke(command: NormalizedCommand, options: InvokeOptions): Promise<unknown> {
    return this.call('invoke', command, options.timeoutMs, options.signal)
  }

  private call(method: string, params: unknown, timeoutMs: number, signal?: AbortSignal): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = randomUUID()
      const socket = createConnection({ path: this.socketPath })
      let buffer = ''
      const timer = setTimeout(() => finish(new DOMException('Matter controller RPC timed out', 'AbortError')), timeoutMs)

      const finish = (error?: Error, result?: unknown) => {
        clearTimeout(timer)
        signal?.removeEventListener('abort', onAbort)
        socket.destroy()
        if (error) reject(error)
        else resolve(result)
      }
      const onAbort = () => finish(new DOMException('Matter controller RPC aborted', 'AbortError'))
      signal?.addEventListener('abort', onAbort, { once: true })

      socket.on('connect', () => socket.write(`${JSON.stringify({ id, method, params })}\n`))
      socket.on('error', (error) => finish(error))
      socket.setEncoding('utf8')
      socket.on('data', (chunk) => {
        buffer += chunk
        const newline = buffer.indexOf('\n')
        if (newline < 0) return
        const response = JSON.parse(buffer.slice(0, newline)) as RpcResponse
        if (response.id !== id) return finish(new Error('Matter controller RPC correlation mismatch'))
        if (response.error) return finish(new Error(`${response.error.code}: ${response.error.message}`))
        finish(undefined, response.result)
      })
    })
  }
}
