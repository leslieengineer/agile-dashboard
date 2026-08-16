import pino from 'pino'

export function createLogger(level: string) {
  return pino({
    level,
    base: { service: 'matter-gateway', version: '0.1.0' },
    redact: ['password', '*.password', 'MQTT_PASSWORD'],
  })
}

export type Logger = ReturnType<typeof createLogger>
