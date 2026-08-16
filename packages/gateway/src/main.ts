import { TOPIC_STATUS } from '@agile/contracts'
import { createCommandRegistry } from './clusters/index.js'
import { loadConfig } from './config.js'
import { createController } from './controller/index.js'
import { createLogger } from './logger.js'
import { connectMqtt } from './mqtt/client.js'
import { createDispatcher } from './mqtt/dispatcher.js'

async function main(): Promise<void> {
  const config = loadConfig()
  const logger = createLogger(config.LOG_LEVEL)
  const registry = createCommandRegistry()
  const controller = createController(config)
  await controller.start()

  const mqtt = await connectMqtt(config)
  const publish = async (topic: string, payload: string) => {
    await mqtt.publishAsync(topic, payload, { qos: 1 })
  }
  const dispatch = createDispatcher({
    registry,
    controller,
    timeoutMs: config.CONTROLLER_TIMEOUT_MS,
    rxTopic: config.MQTT_RX_TOPIC,
    publish,
    logger,
  })

  controller.on('event', (event) => {
    void publish(config.MQTT_RX_TOPIC, JSON.stringify(event)).catch((error: unknown) =>
      logger.error({ error }, 'failed to publish Matter event'),
    )
  })

  mqtt.on('message', (topic, payload) => {
    if (topic === config.MQTT_TX_TOPIC) void dispatch(payload)
  })
  mqtt.on('reconnect', () => logger.warn('reconnecting to MQTT broker'))
  mqtt.on('error', (error) => logger.error({ error }, 'MQTT error'))

  await mqtt.subscribeAsync(config.MQTT_TX_TOPIC, { qos: 1 })
  await publish(
    TOPIC_STATUS,
    JSON.stringify({ online: true, controller: controller.kind, clusters: registry.list() }),
  )
  logger.info({ topic: config.MQTT_TX_TOPIC }, 'gateway started')

  let stopping = false
  const stop = async () => {
    if (stopping) return
    stopping = true
    logger.info('gateway stopping')
    await publish(TOPIC_STATUS, JSON.stringify({ online: false })).catch(() => undefined)
    await mqtt.endAsync()
    await controller.stop()
  }
  process.once('SIGINT', () => void stop())
  process.once('SIGTERM', () => void stop())
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
