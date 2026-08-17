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
