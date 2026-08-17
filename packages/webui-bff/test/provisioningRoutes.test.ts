import { describe, expect, it } from 'vitest'
import { InMemoryDeviceProvisioningRegistry, ProvisioningService } from '@agile/provisioning'
import type { ProvisioningController } from '../src/controllerManagementClient.js'
import { ProvisioningCoordinator } from '../src/provisioningCoordinator.js'
import { handleProvisioningRoute } from '../src/provisioningRoutes.js'

const controller: ProvisioningController = {
  async listNodes() { return ['0x0000000000000001'] },
  async commissionOnNetwork() { return { node_id: '0x0000000000000001' } },
  async removeNode() { return { removed: true } },
  async describeNode(nodeId) {
    return { node_id: nodeId, endpoints: [{ endpoint: 1, server_clusters: [6] }] }
  },
  async read() { return { value: false } },
  async subscribe() { return { subscribed: true } },
}

function coordinator() {
  const service = new ProvisioningService(
    new InMemoryDeviceProvisioningRegistry([]),
    { async getActiveOperationalDataset() { return Buffer.alloc(16) } },
  )
  return new ProvisioningCoordinator(service, controller)
}

describe('provisioning REST route dispatcher', () => {
  it('lists and removes commissioned devices through the private controller', async () => {
    await expect(handleProvisioningRoute(coordinator(), 'GET', '/api/devices')).resolves.toEqual({
      status: 200,
      body: { devices: [{ node_id: '0x0000000000000001', descriptor: {
        node_id: '0x0000000000000001',
        endpoints: [{ endpoint: 1, server_clusters: [6] }],
      } }] },
    })
    await expect(handleProvisioningRoute(coordinator(), 'DELETE', '/api/devices/0x1')).resolves.toEqual({
      status: 200,
      body: { removed: true },
    })
  })

  it('does not claim unrelated API paths', async () => {
    await expect(handleProvisioningRoute(coordinator(), 'GET', '/api/session')).resolves.toBeUndefined()
  })
})
