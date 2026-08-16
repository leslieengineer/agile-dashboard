import { Environment, Filesystem } from '@matter/main'
import { LevelControlClient } from '@matter/main/behaviors/level-control'
import { OnOffClient } from '@matter/main/behaviors/on-off'
import { WindowCoveringClient } from '@matter/main/behaviors/window-covering'
import { NodeId } from '@matter/main/types'
import { NodeJsFilesystem } from '@matter/nodejs'
import { CommissioningController } from '@project-chip/matter.js'
import type { ControllerConfig } from './config.js'

export interface InvokeParams {
  node_id: string
  endpoint: number
  cluster: number
  command: number
  payload: Record<string, unknown>
}

export class MatterRuntime {
  private controller: CommissioningController | undefined

  constructor(private readonly config: ControllerConfig) {}

  async start(): Promise<void> {
    const environment = Environment.default
    environment.set(Filesystem, new NodeJsFilesystem(this.config.storagePath))
    this.controller = new CommissioningController({
      environment: { environment, id: this.config.controllerId },
      autoConnect: true,
      adminFabricLabel: this.config.fabricLabel,
    })
    await this.controller.start()
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
}
