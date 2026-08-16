import type { MatterEvent, NormalizedCommand } from '@agile/contracts'

export interface InvokeOptions {
  timeoutMs: number
  signal?: AbortSignal
}

export interface MatterController {
  readonly kind: 'mock' | 'matterjs'
  start(): Promise<void>
  stop(): Promise<void>
  invoke(command: NormalizedCommand, options: InvokeOptions): Promise<unknown>
  on(event: 'event', listener: (matterEvent: MatterEvent) => void): this
}
