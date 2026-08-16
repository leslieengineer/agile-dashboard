import { createConnection } from 'node:net'
import { randomUUID } from 'node:crypto'

const socketPath = process.env.MATTER_SOCKET_PATH ?? '/run/matter-controller/controller.sock'
const deadline = Date.now() + Number(process.env.MATTER_HEALTH_TIMEOUT_MS ?? 10_000)

function attempt() {
  const id = randomUUID()
  const socket = createConnection({ path: socketPath })
  let buffer = ''

  socket.setEncoding('utf8')
  socket.on('connect', () => socket.write(`${JSON.stringify({ id, method: 'health' })}\n`))
  socket.on('error', (error) => {
    socket.destroy()
    if (Date.now() < deadline && (error.code === 'ENOENT' || error.code === 'ECONNREFUSED')) {
      setTimeout(attempt, 250)
      return
    }
    console.error(error)
    process.exitCode = 1
  })
  socket.on('data', (chunk) => {
    buffer += chunk
    const newline = buffer.indexOf('\n')
    if (newline < 0) return
    const response = JSON.parse(buffer.slice(0, newline))
    console.log(JSON.stringify(response, null, 2))
    socket.end()
    if (response.error || response.result?.ready !== true) process.exitCode = 1
  })
}

attempt()
