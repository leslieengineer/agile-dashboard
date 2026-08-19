import {
  ClaimProofRequestSchema,
  CommissioningCompleteRequestSchema,
  CommissioningSessionCreateRequestSchema,
  CommissioningWindowRequestSchema,
  ThreadAttachedRequestSchema,
  type CommissioningNotification,
  type CommissioningSession,
} from '@agile/contracts'
import { ProvisioningService } from '@agile/provisioning'
import type { ProvisioningController } from './controllerManagementClient.js'

export class ProvisioningCoordinator {
  readonly listeners = new Set<(event: CommissioningNotification) => void>()

  constructor(
    private readonly provisioning: ProvisioningService,
    private readonly controller: ProvisioningController,
  ) {}

  async createSession(input: unknown) {
    const result = await this.provisioning.createSession(CommissioningSessionCreateRequestSchema.parse(input))
    this.emit(result.transaction_id, result.state)
    return result
  }

  async submitClaim(transactionId: string, input: unknown) {
    const result = await this.provisioning.submitClaim(transactionId, ClaimProofRequestSchema.parse(input))
    this.emit(transactionId, result.state)
    return result
  }

  getSession(transactionId: string) {
    return this.provisioning.getSession(transactionId)
  }

  cancel(transactionId: string) {
    const result = this.provisioning.cancel(transactionId)
    this.emitSession(result)
    return result
  }

  threadAttached(transactionId: string, input: unknown) {
    const request = ThreadAttachedRequestSchema.parse(input)
    const result = this.provisioning.markThreadAttached(transactionId, String(request.temporary_node_id))
    this.emitSession(result)
    return result
  }

  async commissionBbbFabric(transactionId: string, input: unknown) {
    const request = CommissioningWindowRequestSchema.parse(input)
    this.emitSession(this.provisioning.markWindowOpen(transactionId))
    this.emitSession(this.provisioning.markBbbCommissioning(transactionId))
    try {
      const commissioned = await this.controller.commissionOnNetwork({
        setup_passcode: request.setup_passcode,
        discriminator: request.discriminator,
      })
      const descriptor = await this.controller.describeNode(commissioned.node_id)
      const endpoints = (descriptor as { endpoints?: Array<{ endpoint?: number; server_clusters?: number[] }> }).endpoints ?? []
      const onOffEndpoint = endpoints.find((endpoint) => endpoint.server_clusters?.includes(0x0006))?.endpoint
      if (onOffEndpoint === undefined) throw new Error('Commissioned node has no OnOff server endpoint')
      await this.controller.read(commissioned.node_id, onOffEndpoint, 0x0006, 0x0000)
      await this.controller.subscribe(commissioned.node_id)
      const session = this.provisioning.markBbbFabricReady(transactionId, commissioned.node_id)
      this.emitSession(session)
      return { session, descriptor }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'BBB Matter commissioning failed'
      const session = this.provisioning.fail(transactionId, 'BBB_COMMISSION_FAILED', message, true)
      this.emitSession(session)
      throw error
    }
  }

  complete(transactionId: string, input: unknown) {
    const request = CommissioningCompleteRequestSchema.parse(input)
    const session = this.provisioning.getSession(transactionId)
    if (session.bbb_node_id !== String(request.bbb_node_id)) throw new Error('BBB node id does not match transaction')
    const result = this.provisioning.complete(transactionId, request.temporary_fabric_removed)
    this.emitSession(result)
    return result
  }

  async listDevices() {
    const nodeIds = await this.controller.listNodes()
    return Promise.all(nodeIds.map(async (nodeId) => ({ node_id: nodeId, descriptor: await this.controller.describeNode(nodeId) })))
  }

  async getDevice(nodeId: string) {
    return { node_id: nodeId, descriptor: await this.controller.describeNode(nodeId) }
  }

  async removeDevice(nodeId: string) {
    return this.controller.removeNode(nodeId)
  }

  private emitSession(session: CommissioningSession): void {
    this.emit(session.transaction_id, session.state, session.error)
  }

  private emit(
    transactionId: string,
    state: CommissioningSession['state'],
    error?: CommissioningSession['error'],
  ): void {
    const event: CommissioningNotification = {
      type: 'provisioning',
      transaction_id: transactionId,
      state,
      timestamp: new Date().toISOString(),
      ...(error === undefined ? {} : { error }),
    }
    for (const listener of this.listeners) listener(event)
  }
}
