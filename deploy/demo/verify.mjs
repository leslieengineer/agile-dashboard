import mqtt from 'mqtt'

const host = process.argv[2] ?? '127.0.0.1'
const request_id = crypto.randomUUID()
const username = process.env.MQTT_USERNAME
const password = process.env.MQTT_PASSWORD
const url = process.env.MQTT_URL ?? `mqtt://${host}:1883`
const client = mqtt.connect(url, {
  clientId: `verify-${request_id}`,
  ...(username ? { username } : {}),
  ...(password ? { password } : {}),
})
const timer = setTimeout(() => {
  console.error('Timed out waiting for home/control/rx')
  client.end(true)
  process.exitCode = 1
}, 5000)

client.on('connect', async () => {
  await client.subscribeAsync('home/control/rx', { qos: 1 })
  await client.publishAsync(
    'home/control/tx',
    JSON.stringify({
      request_id,
      node_id: '1',
      endpoint: 1,
      cluster: 'OnOff',
      command: 'On',
      payload: {},
    }),
    { qos: 1 },
  )
})

client.on('message', (_topic, payload) => {
  const message = JSON.parse(payload.toString())
  if (message.request_id !== request_id) return
  clearTimeout(timer)
  console.log(JSON.stringify(message, null, 2))
  client.end()
})
