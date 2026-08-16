import { connectAsync, type IClientOptions, type MqttClient } from 'mqtt'
import { TOPIC_STATUS } from '@agile/contracts'
import type { GatewayConfig } from '../config.js'

export async function connectMqtt(config: GatewayConfig): Promise<MqttClient> {
  const options: IClientOptions = {
    clientId: config.MQTT_CLIENT_ID,
    username: config.MQTT_USERNAME,
    password: config.MQTT_PASSWORD,
    clean: true,
    reconnectPeriod: 2000,
    will: {
      topic: TOPIC_STATUS,
      payload: Buffer.from(JSON.stringify({ online: false })),
      qos: 1,
      retain: true,
    },
  }
  return connectAsync(config.MQTT_URL, options)
}
