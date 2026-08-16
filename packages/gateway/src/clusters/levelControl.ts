import {
  CLUSTERS,
  COMMANDS,
  EmptyPayloadSchema,
  MovePayloadSchema,
  MoveToLevelPayloadSchema,
  StepPayloadSchema,
} from '@agile/contracts'
import type { z } from 'zod'
import type { ClusterModule } from '../registry/types.js'

const cluster = CLUSTERS.LevelControl
const invoke = (command: number, name: string, payloadSchema: z.ZodTypeAny) => ({
  cluster,
  command,
  name,
  payloadSchema,
  execute: (controller, request, signal) => controller.invoke(request, { timeoutMs: 0, signal }),
}) satisfies ClusterModule['handlers'][number]

export const levelControlModule: ClusterModule = {
  clusterId: cluster,
  name: 'LevelControl',
  handlers: [
    invoke(COMMANDS[cluster].MoveToLevel, 'MoveToLevel', MoveToLevelPayloadSchema),
    invoke(COMMANDS[cluster].MoveToLevelWithOnOff, 'MoveToLevelWithOnOff', MoveToLevelPayloadSchema),
    invoke(COMMANDS[cluster].Move, 'Move', MovePayloadSchema),
    invoke(COMMANDS[cluster].Step, 'Step', StepPayloadSchema),
    invoke(COMMANDS[cluster].Stop, 'Stop', EmptyPayloadSchema),
  ],
}
