import type { MatterEvent, NormalizedCommand } from '@agile/contracts'

export interface InvokeOptions {
  timeoutMs: number
  signal?: AbortSignal
}

export interface CommissionOnNetworkRequest {
  setup_passcode: number
  discriminator: number
  assigned_node_id?: string
  country_code?: string
}

export interface ReadRequest {
  node_id: string
  endpoint: number
  cluster: number
  attribute: number
}

export interface MatterController {
  readonly kind: 'mock' | 'matterjs'
  start(): Promise<void>
  stop(): Promise<void>
  invoke(command: NormalizedCommand, options: InvokeOptions): Promise<unknown>
  commissionOnNetwork?(request: CommissionOnNetworkRequest, options: InvokeOptions): Promise<unknown>
  removeNode?(nodeId: string, options: InvokeOptions): Promise<unknown>
  describeNode?(nodeId: string, options: InvokeOptions): Promise<unknown>
  read?(request: ReadRequest, options: InvokeOptions): Promise<unknown>
  subscribe?(nodeId: string, options: InvokeOptions): Promise<unknown>
  on(event: 'event', listener: (matterEvent: MatterEvent) => void): this
}
