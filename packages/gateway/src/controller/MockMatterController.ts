import { EventEmitter } from 'node:events'
import {
  CLUSTERS,
  COMMANDS,
  TEST_VENDOR_ID,
  type MatterEvent,
  type NormalizedCommand,
} from '@agile/contracts'
import { GatewayError } from '../errors.js'
import type { InvokeOptions, MatterController } from './MatterController.js'

interface MockState {
  on: boolean
  level: number
  liftPercent100ths: number
  panelLocked: boolean
  zones: number[]
  boosts: boolean[]
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

export class MockMatterController extends EventEmitter implements MatterController {
  readonly kind = 'mock' as const
  private readonly nodes = new Map<string, MockState>([
    [
      '0x0000000000000001',
      { on: false, level: 0, liftPercent100ths: 0, panelLocked: false, zones: [0, 0, 0, 0], boosts: [false, false, false, false] },
    ],
  ])

  constructor(private readonly latencyMs = 30) {
    super()
  }

  async start(): Promise<void> {}
  async stop(): Promise<void> {}

  override on(event: 'event', listener: (matterEvent: MatterEvent) => void): this {
    return super.on(event, listener)
  }

  async invoke(command: NormalizedCommand, options: InvokeOptions): Promise<unknown> {
    await delay(this.latencyMs, options.signal)
    const state = this.nodes.get(command.node_id)
    if (!state) throw new GatewayError('NODE_UNKNOWN', `Unknown Matter node ${command.node_id}`)

    const attributes = this.applyCommand(state, command)
    const event: MatterEvent = {
      type: 'event',
      request_id: null,
      node_id: command.node_id,
      endpoint: command.endpoint,
      cluster: command.cluster,
      attributes,
      timestamp: new Date().toISOString(),
    }
    this.emit('event', event)
    return { attributes }
  }

  private applyCommand(state: MockState, command: NormalizedCommand): Record<string, unknown> {
    if (command.cluster === CLUSTERS.OnOff) {
      if (command.command === COMMANDS[CLUSTERS.OnOff].Off) state.on = false
      else if (command.command === COMMANDS[CLUSTERS.OnOff].On) state.on = true
      else if (command.command === COMMANDS[CLUSTERS.OnOff].Toggle) state.on = !state.on
      return { OnOff: state.on }
    }

    if (command.cluster === CLUSTERS.LevelControl) {
      if ('level' in command.payload) state.level = Number(command.payload.level)
      return { CurrentLevel: state.level }
    }

    if (command.cluster === CLUSTERS.WindowCovering) {
      if (command.command === COMMANDS[CLUSTERS.WindowCovering].UpOrOpen) state.liftPercent100ths = 0
      else if (command.command === COMMANDS[CLUSTERS.WindowCovering].DownOrClose) state.liftPercent100ths = 10_000
      else if ('liftPercent100ths' in command.payload) state.liftPercent100ths = Number(command.payload.liftPercent100ths)
      return { CurrentPositionLiftPercent100ths: state.liftPercent100ths }
    }

    if (command.cluster === CLUSTERS.VendorCooktop) {
      if (Number(command.payload.vendor_id) !== TEST_VENDOR_ID) {
        throw new GatewayError('INVALID_PAYLOAD', 'Unsupported cooktop vendor_id')
      }
      if (command.command === COMMANDS[CLUSTERS.VendorCooktop].LockPanel) {
        state.panelLocked = Boolean(command.payload.locked)
      } else if (command.command === COMMANDS[CLUSTERS.VendorCooktop].StopAll) {
        state.zones.fill(0)
        state.boosts.fill(false)
      } else {
        if (state.panelLocked) throw new GatewayError('CONTROLLER_ERROR', 'Cooktop panel is locked')
        const zone = Number(command.payload.zone)
        if (command.command === COMMANDS[CLUSTERS.VendorCooktop].SetZonePower) {
          state.zones[zone] = Number(command.payload.powerLevel)
        } else if (command.command === COMMANDS[CLUSTERS.VendorCooktop].SetBoost) {
          state.boosts[zone] = Boolean(command.payload.enabled)
        }
      }
      return { PanelLocked: state.panelLocked, ZonePower: state.zones, Boost: state.boosts }
    }

    throw new GatewayError('UNKNOWN_CLUSTER', `Unsupported cluster ${command.cluster}`)
  }
}
