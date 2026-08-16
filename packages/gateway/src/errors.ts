import type { GatewayErrorCode } from '@agile/contracts'

export class GatewayError extends Error {
  constructor(
    public readonly code: GatewayErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message)
  }
}

export function asGatewayError(error: unknown): GatewayError {
  if (error instanceof GatewayError) return error
  if (error instanceof Error && error.name === 'AbortError') {
    return new GatewayError('TIMEOUT', 'Matter controller request timed out')
  }
  return new GatewayError('INTERNAL', 'Unexpected gateway error')
}
