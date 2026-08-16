import type { GatewayConfig } from '../config.js'
import { MatterJsController } from './MatterJsController.js'
import { MockMatterController } from './MockMatterController.js'

export function createController(config: GatewayConfig) {
  if (config.CONTROLLER_MODE === 'matterjs') return new MatterJsController(config.MATTER_SOCKET_PATH)
  return new MockMatterController(config.MOCK_LATENCY_MS)
}

export type { MatterController } from './MatterController.js'
export { MockMatterController } from './MockMatterController.js'
