import { loadConfig } from './config.js'
import { MatterRuntime, type InvokeParams } from './MatterRuntime.js'
import { JsonRpcServer } from './rpc.js'

async function main(): Promise<void> {
  const config = loadConfig()
  const runtime = new MatterRuntime(config)
  await runtime.start()

  const rpc = new JsonRpcServer(config.socketPath, async (method, params) => {
    if (method === 'health') return runtime.health()
    if (method === 'listNodes') return runtime.listNodes()
    if (method === 'invoke') return runtime.invoke(params as InvokeParams)
    throw new Error(`Unknown RPC method ${method}`)
  })
  await rpc.start()
  console.log(JSON.stringify({ service: 'matter-controller', status: 'ready', socket: config.socketPath }))

  let stopping = false
  const stop = async () => {
    if (stopping) return
    stopping = true
    await rpc.stop()
    await runtime.stop()
  }
  process.once('SIGINT', () => void stop())
  process.once('SIGTERM', () => void stop())
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
