import { Environment, Filesystem } from '@matter/main'
import { LevelControlClient } from '@matter/main/behaviors/level-control'
import { OnOffClient } from '@matter/main/behaviors/on-off'
import { WindowCoveringClient } from '@matter/main/behaviors/window-covering'
import { GeneralCommissioning } from '@matter/main/clusters'
import { NodeId } from '@matter/main/types'
import { NodeJsFilesystem } from '@matter/nodejs'
import { CommissioningController, type NodeCommissioningOptions } from '@project-chip/matter.js'
import type { ControllerConfig } from './config.js'

export interface InvokeParams {
  node_id: string
  endpoint: number
  cluster: number
  command: number
  payload: Record<string, unknown>
}

export interface CommissionOnNetworkParams {
  setup_passcode: number
  discriminator: number
  assigned_node_id?: string
  country_code?: string
}

export interface ReadParams {
  node_id: string
  endpoint: number
  cluster: number
  attribute: number
}

export interface NodeParams {
  node_id: string
}

export interface ControllerAttributeEvent {
  node_id: string
  endpoint: number
  cluster: number
  attribute: number
  value: unknown
}

export type ControllerEventSink = (method: 'attributeChanged', event: ControllerAttributeEvent) => void

export class MatterRuntime {
  private controller: CommissioningController | undefined
  private eventSink: ControllerEventSink | undefined
  private readonly subscribedNodes = new Set<string>()

  constructor(private readonly config: ControllerConfig) {}

  async start(): Promise<void> {
    const environment = Environment.default
    environment.set(Filesystem, new NodeJsFilesystem(this.config.storagePath))
    this.controller = new CommissioningController({
      environment: { environment, id: this.config.controllerId },
      autoConnect: true,
      autoSubscribe: true,
      adminFabricLabel: this.config.fabricLabel,
    })
    await this.controller.start()
    for (const nodeId of this.controller.getCommissionedNodes()) {
      void this.ensureSubscription(nodeId).catch(() => undefined)
    }
  }

  async stop(): Promise<void> {
    await this.controller?.close()
    this.controller = undefined
  }

  health() {
    return {
      ready: this.controller !== undefined,
      controller: 'matter.js',
      version: '0.17.9',
      commissioned_nodes: this.listNodes(),
    }
  }

  listNodes(): string[] {
    return (this.controller?.getCommissionedNodes() ?? []).map((nodeId) =>
      `0x${BigInt(nodeId).toString(16).padStart(16, '0')}`,
    )
  }

  setEventSink(sink: ControllerEventSink): void {
    this.eventSink = sink
  }

  async commissionOnNetwork(params: CommissionOnNetworkParams): Promise<{ node_id: string }> {
    const controller = this.requireController()
    if (!Number.isInteger(params.setup_passcode) || params.setup_passcode <= 0) throw new Error('Invalid setup passcode')
    if (!Number.isInteger(params.discriminator) || params.discriminator < 0 || params.discriminator > 4095) {
      throw new Error('Invalid discriminator')
    }

    const commissioning: NodeCommissioningOptions['commissioning'] = {
      regulatoryLocation: GeneralCommissioning.RegulatoryLocationType.IndoorOutdoor,
      regulatoryCountryCode: params.country_code ?? 'XX',
      ...(params.assigned_node_id === undefined ? {} : { nodeId: NodeId(BigInt(params.assigned_node_id)) }),
    }
    const options: NodeCommissioningOptions = {
      passcode: params.setup_passcode,
      commissioning,
      discovery: { identifierData: { longDiscriminator: params.discriminator } },
      autoConnect: true,
      autoSubscribe: true,
    }
    const nodeId = await controller.commissionNode(options)
    await this.ensureSubscription(nodeId)
    return { node_id: this.formatNodeId(nodeId) }
  }

  async removeNode(params: NodeParams): Promise<{ removed: true }> {
    const controller = this.requireController()
    const nodeId = NodeId(BigInt(params.node_id))
    await controller.removeNode(nodeId, true)
    this.subscribedNodes.delete(this.formatNodeId(nodeId))
    return { removed: true }
  }

  async describeNode(params: NodeParams): Promise<unknown> {
    const node = await this.getConnectedNode(params.node_id)
    const endpoints = Array.from(node.parts.values()).map((endpoint) => {
      const onOff = endpoint.maybeStateOf(OnOffClient)
      return {
        endpoint: endpoint.number,
        server_clusters: onOff === undefined ? [] : [0x0006],
        attributes: onOff === undefined ? {} : { OnOff: onOff.onOff },
      }
    })
    return { node_id: params.node_id, endpoints }
  }

  async read(params: ReadParams): Promise<unknown> {
    const node = await this.getConnectedNode(params.node_id)
    const endpoint = node.parts.get(params.endpoint)
    if (!endpoint) throw new Error(`Endpoint ${params.endpoint} not found on ${params.node_id}`)
    if (params.cluster === 0x0006 && params.attribute === 0x0000) {
      const state = await endpoint.getStateOf(OnOffClient, ['onOff'])
      return { node_id: params.node_id, endpoint: params.endpoint, cluster: params.cluster, attribute: params.attribute, value: state.onOff }
    }
    throw new Error(`Read path ${params.endpoint}/${params.cluster}/${params.attribute} is not supported`)
  }

  async subscribe(params: NodeParams): Promise<{ subscribed: true }> {
    await this.ensureSubscription(NodeId(BigInt(params.node_id)))
    return { subscribed: true }
  }

  async invoke(params: InvokeParams): Promise<unknown> {
    const controller = this.controller
    if (!controller) throw new Error('Matter controller is not started')
    const nodeId = NodeId(BigInt(params.node_id))
    if (!controller.getCommissionedNodes().includes(nodeId)) throw new Error(`Node ${params.node_id} is not commissioned`)

    const node = await controller.getNode(nodeId)
    if (!node.isConnected) node.connect()
    if (!node.initialized) await node.events.initialized
    const endpoint = node.parts.get(params.endpoint)
    if (!endpoint) throw new Error(`Endpoint ${params.endpoint} not found on ${params.node_id}`)

    if (params.cluster === 0x0006) {
      const commands = endpoint.commandsOf(OnOffClient)
      if (params.command === 0x00) await commands.off()
      else if (params.command === 0x01) await commands.on()
      else if (params.command === 0x02) await commands.toggle()
      else throw new Error(`Unsupported OnOff command ${params.command}`)
      return { accepted: true, attributes: { OnOff: endpoint.stateOf(OnOffClient)?.onOff } }
    }

    if (params.cluster === 0x0008) {
      const commands = endpoint.commandsOf(LevelControlClient)
      if (params.command === 0x00 || params.command === 0x04) {
        const request = {
          level: Number(params.payload.level),
          transitionTime: params.payload.transitionTime === undefined ? null : Number(params.payload.transitionTime),
          optionsMask: { executeIfOff: false, coupleColorTempToLevel: false },
          optionsOverride: { executeIfOff: false, coupleColorTempToLevel: false },
        }
        if (params.command === 0x00) await commands.moveToLevel(request)
        else await commands.moveToLevelWithOnOff(request)
      } else if (params.command === 0x03) {
        await commands.stop({
          optionsMask: { executeIfOff: false, coupleColorTempToLevel: false },
          optionsOverride: { executeIfOff: false, coupleColorTempToLevel: false },
        })
      } else {
        throw new Error(`LevelControl command ${params.command} is not implemented yet`)
      }
      return { accepted: true, attributes: { CurrentLevel: endpoint.stateOf(LevelControlClient)?.currentLevel } }
    }

    if (params.cluster === 0x0102) {
      const commands = endpoint.commandsOf(WindowCoveringClient)
      if (params.command === 0x00) await commands.upOrOpen()
      else if (params.command === 0x01) await commands.downOrClose()
      else if (params.command === 0x02) await commands.stopMotion()
      else if (params.command === 0x05) {
        await commands.goToLiftPercentage({ liftPercent100thsValue: Number(params.payload.liftPercent100ths) })
      } else if (params.command === 0x08) {
        await commands.goToTiltPercentage({ tiltPercent100thsValue: Number(params.payload.tiltPercent100ths) })
      } else throw new Error(`Unsupported WindowCovering command ${params.command}`)
      return {
        accepted: true,
        attributes: {
          CurrentPositionLiftPercent100ths: endpoint.stateOf(WindowCoveringClient)?.currentPositionLiftPercent100ths,
        },
      }
    }

    throw new Error(`Cluster ${params.cluster} is not supported by the Matter.js adapter`)
  }

  private requireController(): CommissioningController {
    if (!this.controller) throw new Error('Matter controller is not started')
    return this.controller
  }

  private formatNodeId(nodeId: ReturnType<typeof NodeId>): string {
    return `0x${BigInt(nodeId).toString(16).padStart(16, '0')}`
  }

  private async getConnectedNode(nodeIdText: string) {
    const controller = this.requireController()
    const nodeId = NodeId(BigInt(nodeIdText))
    if (!controller.getCommissionedNodes().includes(nodeId)) throw new Error(`Node ${nodeIdText} is not commissioned`)
    const node = await controller.getNode(nodeId)
    if (!node.isConnected) node.connect()
    if (!node.initialized) await node.events.initialized
    return node
  }

  private async ensureSubscription(nodeId: ReturnType<typeof NodeId>): Promise<void> {
    const formatted = this.formatNodeId(nodeId)
    const node = await this.getConnectedNode(formatted)
    if (this.subscribedNodes.has(formatted)) return
    node.events.attributeChanged.on((data) => {
      if (data.path.clusterId !== 0x0006 || data.path.attributeId !== 0x0000) return
      this.eventSink?.('attributeChanged', {
        node_id: formatted,
        endpoint: Number(data.path.endpointId),
        cluster: Number(data.path.clusterId),
        attribute: Number(data.path.attributeId),
        value: data.value,
      })
    })
    await node.subscribeAllAttributesAndEvents()
    this.subscribedNodes.add(formatted)
  }
}
