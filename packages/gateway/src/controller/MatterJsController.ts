import { randomUUID } from 'node:crypto'
import { EventEmitter } from 'node:events'
import { createConnection, type Socket } from 'node:net'
import type { MatterEvent, NormalizedCommand } from '@agile/contracts'
import type {
  CommissionOnNetworkRequest,
  InvokeOptions,
  MatterController,
  ReadRequest,
} from './MatterController.js'

interface RpcResponse {
  id: string
  result?: unknown
  error?: { code: string; message: string }
}

interface RpcNotification {
  method: string
  params: unknown
}

interface AttributeNotification {
  node_id: string
  endpoint: number
  cluster: number
  attribute: number
  value: unknown
}

export class MatterJsController extends EventEmitter implements MatterController {
  readonly kind = 'matterjs' as const
  private eventSocket: Socket | undefined
  private eventBuffer = ''
  private stopping = false

  constructor(private readonly socketPath: string) {
    super()
  }

  override on(event: 'event', listener: (matterEvent: MatterEvent) => void): this {
    return super.on(event, listener)
  }

  async start(): Promise<void> {
    this.stopping = false
    await this.call('health', undefined, 5000)
    await this.connectEventStream()
  }

  async stop(): Promise<void> {
    this.stopping = true
    this.eventSocket?.destroy()
    this.eventSocket = undefined
    this.eventBuffer = ''
  }

  invoke(command: NormalizedCommand, options: InvokeOptions): Promise<unknown> {
    return this.call('invoke', command, options.timeoutMs, options.signal)
  }

  commissionOnNetwork(request: CommissionOnNetworkRequest, options: InvokeOptions): Promise<unknown> {
    return this.call('commissionOnNetwork', request, options.timeoutMs, options.signal)
  }

  removeNode(nodeId: string, options: InvokeOptions): Promise<unknown> {
    return this.call('removeNode', { node_id: nodeId }, options.timeoutMs, options.signal)
  }

  describeNode(nodeId: string, options: InvokeOptions): Promise<unknown> {
    return this.call('describeNode', { node_id: nodeId }, options.timeoutMs, options.signal)
  }

  read(request: ReadRequest, options: InvokeOptions): Promise<unknown> {
    return this.call('read', request, options.timeoutMs, options.signal)
  }

  subscribe(nodeId: string, options: InvokeOptions): Promise<unknown> {
    return this.call('subscribe', { node_id: nodeId }, options.timeoutMs, options.signal)
  }

  private call(method: string, params: unknown, timeoutMs: number, signal?: AbortSignal): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = randomUUID()
      const socket = createConnection({ path: this.socketPath })
      let buffer = ''
      const effectiveTimeoutMs = timeoutMs > 0 ? timeoutMs : 5000
      const timer = setTimeout(() => finish(new DOMException('Matter controller RPC timed out', 'AbortError')), effectiveTimeoutMs)

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
        let newline = buffer.indexOf('\n')
        while (newline >= 0) {
          const line = buffer.slice(0, newline)
          buffer = buffer.slice(newline + 1)
          newline = buffer.indexOf('\n')
          if (!line.trim()) continue
          const message = JSON.parse(line) as RpcResponse | RpcNotification
          if ('method' in message) {
            this.handleNotification(message)
            continue
          }
          if (message.id !== id) return finish(new Error('Matter controller RPC correlation mismatch'))
          if (message.error) return finish(new Error(`${message.error.code}: ${message.error.message}`))
          return finish(undefined, message.result)
        }
      })
    })
  }

  private connectEventStream(): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = createConnection({ path: this.socketPath })
      this.eventSocket = socket
      socket.setEncoding('utf8')
      socket.once('connect', resolve)
      socket.once('error', reject)
      socket.on('data', (chunk) => this.handleEventData(String(chunk)))
      socket.on('close', () => {
        if (this.eventSocket === socket) this.eventSocket = undefined
        if (!this.stopping) setTimeout(() => void this.connectEventStream().catch(() => undefined), 1000).unref()
      })
    })
  }

  private handleEventData(chunk: string): void {
    this.eventBuffer += chunk
    let newline = this.eventBuffer.indexOf('\n')
    while (newline >= 0) {
      const line = this.eventBuffer.slice(0, newline)
      this.eventBuffer = this.eventBuffer.slice(newline + 1)
      newline = this.eventBuffer.indexOf('\n')
      if (!line.trim()) continue
      const message = JSON.parse(line) as RpcNotification
      if ('method' in message) this.handleNotification(message)
    }
  }

  private handleNotification(notification: RpcNotification): void {
    if (notification.method !== 'attributeChanged') return
    const value = notification.params as AttributeNotification
    const attributeName = value.cluster === 0x0006 && value.attribute === 0x0000
      ? 'OnOff'
      : `0x${value.attribute.toString(16)}`
    const event: MatterEvent = {
      type: 'event',
      request_id: null,
      node_id: value.node_id,
      endpoint: value.endpoint,
      cluster: value.cluster,
      attributes: { [attributeName]: value.value },
      timestamp: new Date().toISOString(),
    }
    this.emit('event', event)
  }
}
