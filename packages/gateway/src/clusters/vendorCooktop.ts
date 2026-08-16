import {
  CLUSTERS,
  COMMANDS,
  LockPanelPayloadSchema,
  SetBoostPayloadSchema,
  SetZonePowerPayloadSchema,
  VendorPayloadSchema,
} from '@agile/contracts'
import type { z } from 'zod'
import type { ClusterModule } from '../registry/types.js'

const cluster = CLUSTERS.VendorCooktop
const invoke = (command: number, name: string, payloadSchema: z.ZodTypeAny) => ({
  cluster,
  command,
  name,
  payloadSchema,
  execute: (controller, request, signal) => controller.invoke(request, { timeoutMs: 0, signal }),
}) satisfies ClusterModule['handlers'][number]

export const vendorCooktopModule: ClusterModule = {
  clusterId: cluster,
  name: 'VendorCooktop',
  handlers: [
    invoke(COMMANDS[cluster].SetZonePower, 'SetZonePower', SetZonePowerPayloadSchema),
    invoke(COMMANDS[cluster].SetBoost, 'SetBoost', SetBoostPayloadSchema),
    invoke(COMMANDS[cluster].LockPanel, 'LockPanel', LockPanelPayloadSchema),
    invoke(COMMANDS[cluster].StopAll, 'StopAll', VendorPayloadSchema),
  ],
}
