import { ProvisioningCoordinator } from './provisioningCoordinator.js'

export interface ProvisioningRouteResult {
  status: number
  body?: unknown
}

export async function handleProvisioningRoute(
  coordinator: ProvisioningCoordinator,
  method: string,
  pathname: string,
  requestBody?: unknown,
): Promise<ProvisioningRouteResult | undefined> {
  if (method === 'POST' && pathname === '/api/commissioning/sessions') {
    return { status: 201, body: await coordinator.createSession(requestBody) }
  }

  const sessionMatch = /^\/api\/commissioning\/sessions\/([0-9a-f-]+)(?:\/(claim|thread-attached|window|complete))?$/.exec(pathname)
  if (sessionMatch) {
    const transactionId = sessionMatch[1]
    const action = sessionMatch[2]
    if (!transactionId) return { status: 404 }
    if (method === 'GET' && action === undefined) return { status: 200, body: coordinator.getSession(transactionId) }
    if (method === 'DELETE' && action === undefined) return { status: 200, body: coordinator.cancel(transactionId) }
    if (method === 'POST' && action === 'claim') return { status: 200, body: await coordinator.submitClaim(transactionId, requestBody) }
    if (method === 'POST' && action === 'thread-attached') return { status: 200, body: coordinator.threadAttached(transactionId, requestBody) }
    if (method === 'POST' && action === 'window') return { status: 200, body: await coordinator.commissionBbbFabric(transactionId, requestBody) }
    if (method === 'POST' && action === 'complete') return { status: 200, body: coordinator.complete(transactionId, requestBody) }
    return { status: 405 }
  }

  if (method === 'GET' && pathname === '/api/devices') {
    return { status: 200, body: { devices: await coordinator.listDevices() } }
  }

  const deviceMatch = /^\/api\/devices\/(0x[0-9a-fA-F]{1,16})$/.exec(pathname)
  if (deviceMatch) {
    const nodeId = deviceMatch[1]
    if (!nodeId) return { status: 404 }
    if (method === 'GET') return { status: 200, body: await coordinator.getDevice(nodeId) }
    if (method === 'DELETE') return { status: 200, body: await coordinator.removeDevice(nodeId) }
    return { status: 405 }
  }

  return undefined
}
