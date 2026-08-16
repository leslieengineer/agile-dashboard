import { z } from 'zod'
import { TOPIC_RX, TOPIC_TX } from '@agile/contracts'

const ConfigSchema = z.object({
  MQTT_URL: z.string().url().default('mqtt://127.0.0.1:1883'),
  MQTT_USERNAME: z.string().min(1),
  MQTT_PASSWORD: z.string().min(1),
  MQTT_CLIENT_ID: z.string().min(1).default('matter-gateway'),
  MQTT_TX_TOPIC: z.string().min(1).default(TOPIC_TX),
  MQTT_RX_TOPIC: z.string().min(1).default(TOPIC_RX),
  CONTROLLER_MODE: z.enum(['mock', 'matterjs']).default('mock'),
  MATTER_SOCKET_PATH: z.string().min(1).default('/run/matter-controller/controller.sock'),
  CONTROLLER_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
  MOCK_LATENCY_MS: z.coerce.number().int().nonnegative().default(30),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
})

export type GatewayConfig = z.infer<typeof ConfigSchema>

export function loadConfig(env: NodeJS.ProcessEnv = process.env): GatewayConfig {
  for (const [name, value] of Object.entries(env)) {
    if ((name.includes('SERIAL') || name.includes('UART')) && value?.includes('/dev/tty')) {
      throw new Error(`${name} must not configure the gateway UART; otbr-agent owns the RCP`)
    }
  }
  return ConfigSchema.parse(env)
}
