import { CLUSTERS, COMMANDS, EmptyPayloadSchema } from '@agile/contracts'
import type { ClusterModule } from '../registry/types.js'

const cluster = CLUSTERS.OnOff
const invoke = (command: number, name: string) => ({
  cluster,
  command,
  name,
  payloadSchema: EmptyPayloadSchema,
  execute: (controller, request, signal) => controller.invoke(request, { timeoutMs: 0, signal }),
}) satisfies ClusterModule['handlers'][number]

export const onOffModule: ClusterModule = {
  clusterId: cluster,
  name: 'OnOff',
  handlers: [
    invoke(COMMANDS[cluster].Off, 'Off'),
    invoke(COMMANDS[cluster].On, 'On'),
    invoke(COMMANDS[cluster].Toggle, 'Toggle'),
  ],
}
