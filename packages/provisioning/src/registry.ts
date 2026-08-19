import { readFile } from 'node:fs/promises'
import { z } from 'zod'
import { decryptRegistryRecord, type EncryptedRegistryRecord } from './crypto.js'

export interface DeviceProvisioningRecord {
  claimId: string
  productId: number
  claimSecret: Buffer
  setupPasscode: number
  discriminator: number
  deviceId: string
}

export interface DeviceProvisioningRegistry {
  findByClaimId(claimId: string): Promise<DeviceProvisioningRecord | undefined>
}

export interface ThreadDatasetProvider {
  getActiveOperationalDataset(): Promise<Buffer>
}

const PlainRecordSchema = z.object({
  product_id: z.number().int().min(1).max(0xffff),
  claim_secret: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
  setup_passcode: z.number().int().min(1).max(99_999_998),
  discriminator: z.number().int().min(0).max(4095),
  device_id: z.string().min(1).max(128),
}).strict()

const RegistrySchema = z.object({
  version: z.literal(1),
  algorithm: z.literal('AES-256-GCM'),
  records: z.array(z.object({
    claim_id: z.string().regex(/^[A-Za-z0-9_-]{22}$/),
    nonce: z.string().regex(/^[A-Za-z0-9_-]{16}$/),
    ciphertext: z.string().min(1).regex(/^[A-Za-z0-9_-]+$/),
    authentication_tag: z.string().regex(/^[A-Za-z0-9_-]{22}$/),
  }).strict()),
}).strict()

function parseMasterKey(value: Buffer): Buffer {
  const stripped = value.toString('utf8').trim()
  const key = /^[0-9a-fA-F]{64}$/.test(stripped) ? Buffer.from(stripped, 'hex') : Buffer.from(value)
  if (key.length !== 32) throw new Error('Provisioning registry key must be 32 bytes or 64 hexadecimal characters')
  return key
}

export class EncryptedFileDeviceProvisioningRegistry implements DeviceProvisioningRegistry {
  constructor(private readonly registryPath: string, private readonly keyPath: string) {}

  async findByClaimId(claimId: string): Promise<DeviceProvisioningRecord | undefined> {
    const envelope = RegistrySchema.parse(JSON.parse(await readFile(this.registryPath, 'utf8')))
    const encrypted = envelope.records.find(record => record.claim_id === claimId)
    if (!encrypted) return undefined
    const masterKey = parseMasterKey(await readFile(this.keyPath))
    try {
      const plain = PlainRecordSchema.parse(decryptRegistryRecord(masterKey, encrypted as EncryptedRegistryRecord))
      const claimSecret = Buffer.from(plain.claim_secret, 'base64url')
      if (claimSecret.length !== 32) throw new Error('Provisioning claim secret must be 32 bytes')
      return {
        claimId,
        productId: plain.product_id,
        claimSecret,
        setupPasscode: plain.setup_passcode,
        discriminator: plain.discriminator,
        deviceId: plain.device_id,
      }
    } finally {
      masterKey.fill(0)
    }
  }
}

export class FileThreadDatasetProvider implements ThreadDatasetProvider {
  constructor(private readonly datasetPath: string) {}

  async getActiveOperationalDataset(): Promise<Buffer> {
    const value = (await readFile(this.datasetPath, 'utf8')).trim()
    if (!/^[0-9a-fA-F]+$/.test(value) || value.length < 32 || value.length % 2 !== 0) {
      throw new Error('Thread operational dataset is not valid hexadecimal TLV data')
    }
    return Buffer.from(value, 'hex')
  }
}

export class InMemoryDeviceProvisioningRegistry implements DeviceProvisioningRegistry {
  private readonly records = new Map<string, DeviceProvisioningRecord>()

  constructor(records: DeviceProvisioningRecord[]) {
    for (const record of records) this.records.set(record.claimId, record)
  }

  async findByClaimId(claimId: string): Promise<DeviceProvisioningRecord | undefined> {
    const record = this.records.get(claimId)
    if (!record) return undefined
    return { ...record, claimSecret: Buffer.from(record.claimSecret) }
  }
}
