export const CLUSTERS = {
  OnOff: 0x0006,
  LevelControl: 0x0008,
  WindowCovering: 0x0102,
  VendorCooktop: 0xfc01,
} as const

export const TEST_VENDOR_ID = 0xfff1

export const COMMANDS = {
  [CLUSTERS.OnOff]: { Off: 0x00, On: 0x01, Toggle: 0x02 },
  [CLUSTERS.LevelControl]: {
    MoveToLevel: 0x00,
    Move: 0x01,
    Step: 0x02,
    Stop: 0x03,
    MoveToLevelWithOnOff: 0x04,
  },
  [CLUSTERS.WindowCovering]: {
    UpOrOpen: 0x00,
    DownOrClose: 0x01,
    StopMotion: 0x02,
    GoToLiftPercentage: 0x05,
    GoToTiltPercentage: 0x08,
  },
  [CLUSTERS.VendorCooktop]: {
    SetZonePower: 0x00,
    SetBoost: 0x01,
    LockPanel: 0x02,
    StopAll: 0x03,
  },
} as const

export class UnknownMatterIdError extends Error {
  constructor(
    public readonly kind: 'cluster' | 'command',
    public readonly value: string | number,
  ) {
    super(`Unknown Matter ${kind}: ${String(value)}`)
  }
}

function parseNumericId(value: string): number | undefined {
  if (/^0x[0-9a-f]+$/i.test(value)) return Number.parseInt(value.slice(2), 16)
  if (/^\d+$/.test(value)) return Number.parseInt(value, 10)
  return undefined
}

export function resolveClusterId(value: string | number): number {
  if (typeof value === 'number') {
    if (Number.isInteger(value) && value >= 0 && value <= 0xffff_ffff) return value
    throw new UnknownMatterIdError('cluster', value)
  }

  const numeric = parseNumericId(value)
  if (numeric !== undefined) return resolveClusterId(numeric)
  const match = Object.entries(CLUSTERS).find(([name]) => name.toLowerCase() === value.toLowerCase())
  if (!match) throw new UnknownMatterIdError('cluster', value)
  return match[1]
}

export function resolveCommandId(clusterId: number, value: string | number): number {
  if (typeof value === 'number') {
    if (Number.isInteger(value) && value >= 0 && value <= 0xffff_ffff) return value
    throw new UnknownMatterIdError('command', value)
  }

  const numeric = parseNumericId(value)
  if (numeric !== undefined) return resolveCommandId(clusterId, numeric)
  const commands = COMMANDS[clusterId as keyof typeof COMMANDS]
  const match = commands
    ? Object.entries(commands).find(([name]) => name.toLowerCase() === value.toLowerCase())
    : undefined
  if (!match) throw new UnknownMatterIdError('command', value)
  return match[1]
}
