import { randomUUID } from 'node:crypto'
import { createConnection } from 'node:net'

interface RpcResponse {
  id: string
  result?: unknown
  error?: { code: string; message: string }
}

export interface CommissionOnNetworkInput {
  setup_passcode: number
  discriminator: number
  assigned_node_id?: string
  country_code?: string
}

export interface ProvisioningController {
  listNodes(): Promise<string[]>
  commissionOnNetwork(input: CommissionOnNetworkInput): Promise<{ node_id: string }>
  removeNode(nodeId: string): Promise<{ removed: true }>
  describeNode(nodeId: string): Promise<unknown>
  read(nodeId: string, endpoint: number, cluster: number, attribute: number): Promise<unknown>
  subscribe(nodeId: string): Promise<{ subscribed: true }>
}

export class ControllerManagementClient implements ProvisioningController {
  constructor(private readonly socketPath: string, private readonly timeoutMs = 30_000) {}

  listNodes(): Promise<string[]> {
    return this.call('listNodes', undefined) as Promise<string[]>
  }

  commissionOnNetwork(input: CommissionOnNetworkInput): Promise<{ node_id: string }> {
    return this.call('commissionOnNetwork', input) as Promise<{ node_id: string }>
  }

  removeNode(nodeId: string): Promise<{ removed: true }> {
    return this.call('removeNode', { node_id: nodeId }) as Promise<{ removed: true }>
  }

  describeNode(nodeId: string): Promise<unknown> {
    return this.call('describeNode', { node_id: nodeId })
  }

  read(nodeId: string, endpoint: number, cluster: number, attribute: number): Promise<unknown> {
    return this.call('read', { node_id: nodeId, endpoint, cluster, attribute })
  }

  subscribe(nodeId: string): Promise<{ subscribed: true }> {
    return this.call('subscribe', { node_id: nodeId }) as Promise<{ subscribed: true }>
  }

  private call(method: string, params: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = randomUUID()
      const socket = createConnection({ path: this.socketPath })
      let buffer = ''
      const timer = setTimeout(() => finish(new Error('Matter controller management RPC timed out')), this.timeoutMs)
      const finish = (error?: Error, value?: unknown) => {
        clearTimeout(timer)
        socket.destroy()
        if (error) reject(error)
        else resolve(value)
      }
      socket.on('connect', () => socket.write(`${JSON.stringify({ id, method, params })}\n`))
      socket.on('error', (error) => finish(error))
      socket.setEncoding('utf8')
      socket.on('data', (chunk) => {
        buffer += chunk
        let newline = buffer.indexOf('\n')
        while (newline >= 0) {
          const line = buffer.slice(0, newline)
          buffer = buffer.slice(newline + 1)
          newline = buffer.indexOf('\n')
          if (!line.trim()) continue
          const response = JSON.parse(line) as RpcResponse | { method: string; params: unknown }
          if ('method' in response) continue
          if (response.id !== id) return finish(new Error('Matter controller management RPC correlation mismatch'))
          if (response.error) return finish(new Error(`${response.error.code}: ${response.error.message}`))
          return finish(undefined, response.result)
        }
      })
    })
  }
}
