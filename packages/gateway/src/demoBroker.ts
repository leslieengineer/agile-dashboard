import { createServer as createHttpServer } from 'node:http'
import { createServer as createTcpServer } from 'node:net'
import { createBroker } from 'aedes'
import { createWebSocketStream, WebSocketServer } from 'ws'

const broker = createBroker()
const tcpServer = createTcpServer(broker.handle)
const httpServer = createHttpServer()
const webSocketServer = new WebSocketServer({ server: httpServer })

webSocketServer.on('connection', (socket) => {
  broker.handle(createWebSocketStream(socket))
})

tcpServer.listen(1883, '0.0.0.0', () => {
  console.log('Demo MQTT TCP listening on 0.0.0.0:1883')
})
httpServer.listen(9001, '0.0.0.0', () => {
  console.log('Demo MQTT WebSocket listening on 0.0.0.0:9001')
})

async function stop(): Promise<void> {
  webSocketServer.close()
  await Promise.all([
    new Promise<void>((resolve) => tcpServer.close(() => resolve())),
    new Promise<void>((resolve) => httpServer.close(() => resolve())),
    new Promise<void>((resolve) => broker.close(() => resolve())),
  ])
}

process.once('SIGINT', () => void stop())
process.once('SIGTERM', () => void stop())
