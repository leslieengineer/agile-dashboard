import type { NormalizedCommand } from '@agile/contracts'
import type { z } from 'zod'
import type { MatterController } from '../controller/MatterController.js'

export interface CommandHandler {
  cluster: number
  command: number
  name: string
  payloadSchema: z.ZodTypeAny
  execute(controller: MatterController, command: NormalizedCommand, signal: AbortSignal): Promise<unknown>
}

export interface ClusterModule {
  clusterId: number
  name: string
  handlers: CommandHandler[]
}
