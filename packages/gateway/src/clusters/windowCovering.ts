import {
  CLUSTERS,
  COMMANDS,
  EmptyPayloadSchema,
  GoToLiftPercentagePayloadSchema,
  GoToTiltPercentagePayloadSchema,
} from '@agile/contracts'
import type { z } from 'zod'
import type { ClusterModule } from '../registry/types.js'

const cluster = CLUSTERS.WindowCovering
const invoke = (command: number, name: string, payloadSchema: z.ZodTypeAny) => ({
  cluster,
  command,
  name,
  payloadSchema,
  execute: (controller, request, signal) => controller.invoke(request, { timeoutMs: 0, signal }),
}) satisfies ClusterModule['handlers'][number]

export const windowCoveringModule: ClusterModule = {
  clusterId: cluster,
  name: 'WindowCovering',
  handlers: [
    invoke(COMMANDS[cluster].UpOrOpen, 'UpOrOpen', EmptyPayloadSchema),
    invoke(COMMANDS[cluster].DownOrClose, 'DownOrClose', EmptyPayloadSchema),
    invoke(COMMANDS[cluster].StopMotion, 'StopMotion', EmptyPayloadSchema),
    invoke(COMMANDS[cluster].GoToLiftPercentage, 'GoToLiftPercentage', GoToLiftPercentagePayloadSchema),
    invoke(COMMANDS[cluster].GoToTiltPercentage, 'GoToTiltPercentage', GoToTiltPercentagePayloadSchema),
  ],
}
