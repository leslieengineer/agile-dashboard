import {
  CommandRequestSchema,
  CommandResponseSchema,
  MatterEventSchema,
  TOPIC_RX,
  TOPIC_TX,
  type CommandResponse,
  type MatterEvent,
} from '@agile/contracts'
import mqtt, { type MqttClient } from 'mqtt'

export interface MqttConnectionOptions {
  url?: string
  username?: string
  password?: string
}

export interface CommandInput {
  node_id: string
  endpoint: number
  cluster: string | number
  command: string | number
  payload: Record<string, unknown>
}

type MessageListener = (message: CommandResponse | MatterEvent) => void
type ConnectionListener = (connected: boolean, error?: string) => void

function createUuid(): string {
  const cryptoApi = globalThis.crypto
  if (typeof cryptoApi?.randomUUID === 'function') return cryptoApi.randomUUID()
  if (typeof cryptoApi?.getRandomValues !== 'function') throw new Error('This browser cannot generate secure request IDs')

  const bytes = cryptoApi.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6]! & 0x0f) | 0x40
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export class MatterMqttClient {
  private client: MqttClient | undefined
  private readonly pending = new Map<
    string,
    { resolve: (response: CommandResponse) => void; reject: (error: Error) => void; timer: number }
  >()
  private readonly messageListeners = new Set<MessageListener>()
  private readonly connectionListeners = new Set<ConnectionListener>()

  connect(options: MqttConnectionOptions = {}): void {
    const previous = this.client
    this.client = undefined
    if (previous) previous.end(true)

    const defaultUrl = `ws://${window.location.hostname || 'localhost'}:9001`
    const url = options.url || import.meta.env.VITE_MQTT_WS_URL || defaultUrl
    const username = options.username || import.meta.env.VITE_MQTT_USERNAME
    const password = options.password || import.meta.env.VITE_MQTT_PASSWORD
    console.info('MQTT connecting', { url, username })
    const client = mqtt.connect(url, {
      clientId: `webui-${createUuid()}`,
      connectTimeout: 10_000,
      clean: true,
      reconnectPeriod: 2000,
      ...(username ? { username } : {}),
      ...(password ? { password } : {}),
    })
    this.client = client
    client.on('connect', () => {
      if (this.client !== client) return
      void client.subscribeAsync(TOPIC_RX, { qos: 1 })
      console.info('MQTT connected', { url })
      this.emitConnection(true)
    })
    client.on('offline', () => {
      if (this.client === client) this.emitConnection(false)
    })
    client.on('error', (error) => {
      console.error('MQTT error', error)
      if (this.client === client) this.emitConnection(false, error.message)
    })
    client.on('close', () => {
      console.warn('MQTT connection closed', { url })
      if (this.client === client && !client.connected) {
        this.emitConnection(false, 'MQTT connection closed. Check URL and credentials.')
      }
    })
    client.on('message', (_topic, payload) => {
      if (this.client === client) this.handleMessage(payload.toString())
    })
  }

  async disconnect(): Promise<void> {
    const client = this.client
    this.client = undefined
    if (client) await client.endAsync()
    for (const [requestId, pending] of this.pending) {
      clearTimeout(pending.timer)
      pending.reject(new Error(`Request ${requestId} cancelled because MQTT disconnected`))
    }
    this.pending.clear()
    this.emitConnection(false)
  }

  async sendCommand(input: CommandInput): Promise<CommandResponse> {
    if (!this.client?.connected) throw new Error('MQTT is not connected')
    const request = CommandRequestSchema.parse({ ...input, request_id: createUuid() })
    const timeoutMs = Number(import.meta.env.VITE_REQUEST_TIMEOUT_MS ?? 5000)
    const response = new Promise<CommandResponse>((resolve, reject) => {
      const timer = window.setTimeout(() => {
        this.pending.delete(request.request_id)
        reject(new Error(`Request ${request.request_id} timed out`))
      }, timeoutMs)
      this.pending.set(request.request_id, { resolve, reject, timer })
    })
    try {
      await this.client.publishAsync(TOPIC_TX, JSON.stringify(request), { qos: 1 })
    } catch (error) {
      const item = this.pending.get(request.request_id)
      if (item) {
        clearTimeout(item.timer)
        this.pending.delete(request.request_id)
        item.reject(error instanceof Error ? error : new Error('MQTT publish failed'))
      }
    }
    return response
  }

  onMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener)
    return () => this.messageListeners.delete(listener)
  }

  onConnection(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener)
    return () => this.connectionListeners.delete(listener)
  }

  private handleMessage(raw: string): void {
    let value: unknown
    try {
      value = JSON.parse(raw)
    } catch {
      return
    }

    const response = CommandResponseSchema.safeParse(value)
    if (response.success) {
      if (response.data.request_id) {
        const pending = this.pending.get(response.data.request_id)
        if (pending) {
          clearTimeout(pending.timer)
          this.pending.delete(response.data.request_id)
          pending.resolve(response.data)
        }
      }
      this.messageListeners.forEach((listener) => listener(response.data))
      return
    }

    const event = MatterEventSchema.safeParse(value)
    if (event.success) this.messageListeners.forEach((listener) => listener(event.data))
  }

  private emitConnection(connected: boolean, error?: string): void {
    this.connectionListeners.forEach((listener) => listener(connected, error))
  }
}

export const matterMqtt = new MatterMqttClient()
