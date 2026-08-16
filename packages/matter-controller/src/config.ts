export interface ControllerConfig {
  socketPath: string
  storagePath: string
  controllerId: string
  fabricLabel: string
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ControllerConfig {
  return {
    socketPath: env.MATTER_SOCKET_PATH ?? '/run/matter-controller/controller.sock',
    storagePath: env.MATTER_STORAGE_PATH ?? '/var/lib/matter-controller',
    controllerId: env.MATTER_CONTROLLER_ID ?? 'agile-matter-controller',
    fabricLabel: env.MATTER_FABRIC_LABEL ?? 'Agile Smart Home',
  }
}
