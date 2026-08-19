import { chmodSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { z } from 'zod'
import { ProvisioningStateSchema, type ProvisioningState } from '@agile/contracts'

const SnapshotSchema = z.object({
  transactionId: z.string().uuid(),
  claimId: z.string().min(1),
  productId: z.number().int().min(1).max(0xffff),
  state: ProvisioningStateSchema,
  createdAtMs: z.number().int().nonnegative(),
  expiresAtMs: z.number().int().nonnegative(),
  temporaryNodeId: z.string().optional(),
  bbbNodeId: z.string().optional(),
  error: z.object({ code: z.string(), message: z.string(), retryable: z.boolean() }).optional(),
}).strict()

export interface ProvisioningTransactionSnapshot {
  transactionId: string
  claimId: string
  productId: number
  state: ProvisioningState
  createdAtMs: number
  expiresAtMs: number
  temporaryNodeId?: string
  bbbNodeId?: string
  error?: { code: string; message: string; retryable: boolean }
}

export interface ProvisioningTransactionStore {
  load(): ProvisioningTransactionSnapshot[]
  save(snapshots: ProvisioningTransactionSnapshot[]): void
}

export class FileProvisioningTransactionStore implements ProvisioningTransactionStore {
  constructor(private readonly path: string) {}

  load(): ProvisioningTransactionSnapshot[] {
    try {
      const rows = z.array(SnapshotSchema).parse(JSON.parse(readFileSync(this.path, 'utf8')))
      return rows.map(row => ({
        transactionId: row.transactionId,
        claimId: row.claimId,
        productId: row.productId,
        state: row.state,
        createdAtMs: row.createdAtMs,
        expiresAtMs: row.expiresAtMs,
        ...(row.temporaryNodeId === undefined ? {} : { temporaryNodeId: row.temporaryNodeId }),
        ...(row.bbbNodeId === undefined ? {} : { bbbNodeId: row.bbbNodeId }),
        ...(row.error === undefined ? {} : { error: row.error }),
      }))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []
      throw error
    }
  }

  save(snapshots: ProvisioningTransactionSnapshot[]): void {
    const validated = z.array(SnapshotSchema).parse(snapshots)
    const directory = dirname(this.path)
    const temporary = `${this.path}.tmp`
    mkdirSync(directory, { recursive: true, mode: 0o700 })
    writeFileSync(temporary, `${JSON.stringify(validated)}\n`, { encoding: 'utf8', mode: 0o600 })
    chmodSync(temporary, 0o600)
    renameSync(temporary, this.path)
  }
}
