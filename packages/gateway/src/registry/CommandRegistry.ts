import { GatewayError } from '../errors.js'
import type { ClusterModule, CommandHandler } from './types.js'

export class CommandRegistry {
  private readonly handlers = new Map<string, CommandHandler>()
  private readonly clusters = new Map<number, string>()

  register(module: ClusterModule): void {
    if (this.clusters.has(module.clusterId)) {
      throw new Error(`Cluster ${module.clusterId} is already registered`)
    }
    this.clusters.set(module.clusterId, module.name)
    for (const handler of module.handlers) {
      const key = this.key(handler.cluster, handler.command)
      if (this.handlers.has(key)) throw new Error(`Command handler ${key} is already registered`)
      this.handlers.set(key, handler)
    }
  }

  resolve(cluster: number, command: number): CommandHandler {
    if (!this.clusters.has(cluster)) throw new GatewayError('UNKNOWN_CLUSTER', `Unknown cluster ${cluster}`)
    const handler = this.handlers.get(this.key(cluster, command))
    if (!handler) throw new GatewayError('UNKNOWN_COMMAND', `Unknown command ${command} for cluster ${cluster}`)
    return handler
  }

  list(): Array<{ cluster: number; name: string }> {
    return [...this.clusters].map(([cluster, name]) => ({ cluster, name }))
  }

  private key(cluster: number, command: number): string {
    return `${cluster}:${command}`
  }
}
