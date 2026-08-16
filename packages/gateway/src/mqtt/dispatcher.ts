import {
  CommandRequestSchema,
  MAX_PAYLOAD_BYTES,
  UnknownMatterIdError,
  normalizeNodeId,
  resolveClusterId,
  resolveCommandId,
  type CommandResponse,
  type NormalizedCommand,
} from '@agile/contracts'
import type { MatterController } from '../controller/MatterController.js'
import { asGatewayError, GatewayError } from '../errors.js'
import type { Logger } from '../logger.js'
import type { CommandRegistry } from '../registry/CommandRegistry.js'

export interface DispatcherOptions {
  registry: CommandRegistry
  controller: MatterController
  timeoutMs: number
  rxTopic: string
  publish: (topic: string, payload: string) => Promise<void>
  logger: Logger
}

export function createDispatcher(options: DispatcherOptions) {
  return async (payload: Buffer): Promise<CommandResponse> => {
    const started = performance.now()
    let partial: Partial<NormalizedCommand> = {}

    try {
      if (payload.byteLength > MAX_PAYLOAD_BYTES) {
        throw new GatewayError('PAYLOAD_TOO_LARGE', `Command exceeds ${MAX_PAYLOAD_BYTES} bytes`)
      }

      let raw: unknown
      try {
        raw = JSON.parse(payload.toString('utf8'))
      } catch {
        throw new GatewayError('INVALID_ENVELOPE', 'Command is not valid JSON')
      }

      const parsed = CommandRequestSchema.safeParse(raw)
      if (!parsed.success) {
        throw new GatewayError('INVALID_ENVELOPE', 'Command envelope is invalid', parsed.error.flatten())
      }

      let cluster: number
      let command: number
      try {
        cluster = resolveClusterId(parsed.data.cluster)
        command = resolveCommandId(cluster, parsed.data.command)
      } catch (error) {
        if (error instanceof UnknownMatterIdError) {
          throw new GatewayError(error.kind === 'cluster' ? 'UNKNOWN_CLUSTER' : 'UNKNOWN_COMMAND', error.message)
        }
        throw error
      }

      const normalized: NormalizedCommand = {
        request_id: parsed.data.request_id,
        node_id: normalizeNodeId(parsed.data.node_id),
        endpoint: parsed.data.endpoint,
        cluster,
        command,
        payload: parsed.data.payload,
      }
      partial = normalized

      const handler = options.registry.resolve(cluster, command)
      const validPayload = handler.payloadSchema.safeParse(normalized.payload)
      if (!validPayload.success) {
        throw new GatewayError('INVALID_PAYLOAD', 'Command payload is invalid', validPayload.error.flatten())
      }
      normalized.payload = validPayload.data as Record<string, unknown>

      const signal = AbortSignal.timeout(options.timeoutMs)
      const result = await handler.execute(options.controller, normalized, signal)
      const response: CommandResponse = {
        request_id: normalized.request_id,
        node_id: normalized.node_id,
        endpoint: normalized.endpoint,
        cluster: normalized.cluster,
        command: normalized.command,
        status: 'ok',
        result,
        latency_ms: performance.now() - started,
        timestamp: new Date().toISOString(),
      }
      await options.publish(options.rxTopic, JSON.stringify(response))
      options.logger.info({ ...partial, status: 'ok', latency_ms: response.latency_ms }, 'command completed')
      return response
    } catch (cause) {
      const error = asGatewayError(cause)
      const response: CommandResponse = {
        request_id: partial.request_id ?? null,
        node_id: partial.node_id ?? null,
        endpoint: partial.endpoint ?? null,
        cluster: partial.cluster ?? null,
        command: partial.command ?? null,
        status: 'error',
        error: {
          code: error.code,
          message: error.message,
          ...(error.details === undefined ? {} : { details: error.details }),
        },
        latency_ms: performance.now() - started,
        timestamp: new Date().toISOString(),
      }
      await options.publish(options.rxTopic, JSON.stringify(response))
      options.logger.warn({ ...partial, error_code: error.code, latency_ms: response.latency_ms }, 'command failed')
      return response
    }
  }
}
