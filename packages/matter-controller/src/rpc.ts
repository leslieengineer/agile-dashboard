import { createServer, type Server, type Socket } from 'node:net'
import { chmod, mkdir, rm } from 'node:fs/promises'
import { dirname } from 'node:path'

export interface RpcRequest {
  id: string
  method: string
  params?: unknown
}

export interface RpcResponse {
  id: string
  result?: unknown
  error?: { code: string; message: string }
}

export type RpcHandler = (method: string, params: unknown) => Promise<unknown>

export class JsonRpcServer {
  private server: Server | undefined

  constructor(
    private readonly socketPath: string,
    private readonly handler: RpcHandler,
  ) {}

  async start(): Promise<void> {
    await mkdir(dirname(this.socketPath), { recursive: true })
    await rm(this.socketPath, { force: true })
    this.server = createServer((socket) => this.handleSocket(socket))
    await new Promise<void>((resolve, reject) => {
      this.server?.once('error', reject)
      this.server?.listen(this.socketPath, resolve)
    })
    await chmod(this.socketPath, 0o660)
  }

  async stop(): Promise<void> {
    const server = this.server
    this.server = undefined
    if (server) await new Promise<void>((resolve) => server.close(() => resolve()))
    await rm(this.socketPath, { force: true })
  }

  private handleSocket(socket: Socket): void {
    socket.setEncoding('utf8')
    let buffer = ''
    socket.on('data', (chunk) => {
      buffer += chunk
      let newline = buffer.indexOf('\n')
      while (newline >= 0) {
        const line = buffer.slice(0, newline)
        buffer = buffer.slice(newline + 1)
        if (line.trim()) void this.handleLine(socket, line)
        newline = buffer.indexOf('\n')
      }
    })
  }

  private async handleLine(socket: Socket, line: string): Promise<void> {
    let request: RpcRequest
    try {
      request = JSON.parse(line) as RpcRequest
      if (!request.id || !request.method) throw new Error('id and method are required')
    } catch (error) {
      this.write(socket, { id: '', error: { code: 'INVALID_REQUEST', message: String(error) } })
      return
    }

    try {
      const result = await this.handler(request.method, request.params)
      this.write(socket, { id: request.id, result })
    } catch (error) {
      this.write(socket, {
        id: request.id,
        error: { code: 'CONTROLLER_ERROR', message: error instanceof Error ? error.message : String(error) },
      })
    }
  }

  private write(socket: Socket, response: RpcResponse): void {
    socket.write(`${JSON.stringify(response)}\n`)
  }
}
