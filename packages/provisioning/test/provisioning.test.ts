import {
  createCipheriv,
  createDecipheriv,
  createPublicKey,
  diffieHellman,
  generateKeyPairSync,
  hkdfSync,
  type KeyObject,
} from 'node:crypto'
import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  computeClaimProof,
  decodeBase64Url,
  encodeBase64Url,
  EncryptedFileDeviceProvisioningRegistry,
  FileProvisioningTransactionStore,
  FileThreadDatasetProvider,
  InMemoryDeviceProvisioningRegistry,
  ProvisioningService,
  ProvisioningServiceError,
} from '../src/index.js'

const claimIdBytes = Buffer.from('claim-01')
const claimId = encodeBase64Url(claimIdBytes)
const secret = Buffer.from('0123456789abcdef0123456789abcdef')

function mobileKeys() {
  const pair = generateKeyPairSync('x25519')
  return {
    privateKey: pair.privateKey,
    publicKey: encodeBase64Url(pair.publicKey.export({ type: 'spki', format: 'der' })),
  }
}

function service(now = () => Date.parse('2026-08-16T12:00:00.000Z')) {
  const registry = new InMemoryDeviceProvisioningRegistry([{
    claimId,
    productId: 1,
    claimSecret: Buffer.from(secret),
    setupPasscode: 20202021,
    discriminator: 3840,
    deviceId: 'device-01',
  }])
  return new ProvisioningService(registry, {
    async getActiveOperationalDataset() {
      return Buffer.from('00112233445566778899aabbccddeeff', 'hex')
    },
  }, { now, transactionTtlMs: 60_000 })
}

function decryptGrant(
  privateKey: KeyObject,
  grant: {
    server_ephemeral_public_key: string
    nonce: string
    ciphertext: string
    authentication_tag: string
    transaction_id: string
  },
) {
  const publicKey = Buffer.from(grant.server_ephemeral_public_key, 'base64url')
  const serverKey = awaitImportPublicKey(publicKey)
  const shared = diffieHellman({ privateKey, publicKey: serverKey })
  const key = Buffer.from(hkdfSync(
    'sha256',
    shared,
    Buffer.from(grant.transaction_id),
    Buffer.from('rhophi-provisioning-v1'),
    32,
  ))
  const decipher = createDecipheriv('aes-256-gcm', key, decodeBase64Url(grant.nonce))
  decipher.setAAD(Buffer.from(grant.transaction_id))
  decipher.setAuthTag(decodeBase64Url(grant.authentication_tag))
  const plaintext = Buffer.concat([
    decipher.update(decodeBase64Url(grant.ciphertext)),
    decipher.final(),
  ])
  key.fill(0)
  shared.fill(0)
  return JSON.parse(plaintext.toString('utf8')) as Record<string, unknown>
}

function awaitImportPublicKey(der: Buffer) {
  return createPublicKey({ key: der, format: 'der', type: 'spki' })
}

describe('ProvisioningService', () => {
  it('verifies a device claim and encrypts setup material for the mobile key', async () => {
    const keys = mobileKeys()
    const provisioning = service()
    const created = await provisioning.createSession({
      claim_id: claimId,
      product_id: 1,
      mobile_ephemeral_public_key: keys.publicKey,
    })
    const nonce = Buffer.from('device-nonce-001')
    const proof = computeClaimProof(secret, nonce, decodeBase64Url(created.challenge), claimIdBytes)
    const response = await provisioning.submitClaim(created.transaction_id, {
      device_nonce: encodeBase64Url(nonce),
      proof: encodeBase64Url(proof),
    })

    const payload = decryptGrant(keys.privateKey, response.grant)
    expect(payload.setup_passcode).toBe(20202021)
    expect(payload.discriminator).toBe(3840)
    expect(payload.thread_operational_dataset).toBe('ABEiM0RVZneImaq7zN3u_w')
    expect(JSON.stringify(response)).not.toContain('20202021')
  })

  it('rejects nonce replay after an invalid proof', async () => {
    const keys = mobileKeys()
    const provisioning = service()
    const created = await provisioning.createSession({
      claim_id: claimId,
      product_id: 1,
      mobile_ephemeral_public_key: keys.publicKey,
    })
    const nonce = encodeBase64Url(Buffer.from('device-nonce-002'))
    await expect(provisioning.submitClaim(created.transaction_id, {
      device_nonce: nonce,
      proof: encodeBase64Url(Buffer.alloc(32, 1)),
    })).rejects.toMatchObject({ code: 'CLAIM_INVALID' })
    await expect(provisioning.submitClaim(created.transaction_id, {
      device_nonce: nonce,
      proof: encodeBase64Url(Buffer.alloc(32, 2)),
    })).rejects.toMatchObject({ code: 'CLAIM_REPLAYED' })
  })

  it('enforces one active transaction and expiry', async () => {
    let now = Date.parse('2026-08-16T12:00:00.000Z')
    const keys = mobileKeys()
    const provisioning = service(() => now)
    const request = { claim_id: claimId, product_id: 1, mobile_ephemeral_public_key: keys.publicKey }
    const created = await provisioning.createSession(request)
    await expect(provisioning.createSession(request)).rejects.toBeInstanceOf(ProvisioningServiceError)
    now += 61_000
    expect(provisioning.getSession(created.transaction_id).state).toBe('EXPIRED')
    await expect(provisioning.submitClaim(created.transaction_id, {
      device_nonce: encodeBase64Url(Buffer.from('device-nonce-003')),
      proof: encodeBase64Url(Buffer.alloc(32)),
    })).rejects.toMatchObject({ code: 'CLAIM_EXPIRED' })
  })
})

describe('file-backed provisioning data', () => {
  it('decrypts the manufacturing registry and persists non-secret transaction state atomically', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'rhophi-provisioning-'))
    const master = Buffer.from(Array.from({ length: 32 }, (_, index) => index))
    const registeredClaimId = encodeBase64Url(Buffer.alloc(16, 0x42))
    const derived = Buffer.from(hkdfSync('sha256', master, Buffer.from(registeredClaimId), Buffer.from('rhophi-registry-v1'), 32))
    const nonce = Buffer.alloc(12, 0x24)
    const cipher = createCipheriv('aes-256-gcm', derived, nonce)
    cipher.setAAD(Buffer.from(`rhophi-registry-v1:${registeredClaimId}`))
    const ciphertext = Buffer.concat([cipher.update(JSON.stringify({
      product_id: 1,
      claim_secret: encodeBase64Url(secret),
      setup_passcode: 20202021,
      discriminator: 3840,
      device_id: 'device-01',
    })), cipher.final()])
    const registryPath = join(directory, 'devices.registry.enc')
    const keyPath = join(directory, 'registry.key')
    await writeFile(keyPath, master)
    await writeFile(registryPath, JSON.stringify({ version: 1, algorithm: 'AES-256-GCM', records: [{
      claim_id: registeredClaimId,
      nonce: encodeBase64Url(nonce),
      ciphertext: encodeBase64Url(ciphertext),
      authentication_tag: encodeBase64Url(cipher.getAuthTag()),
    }] }))
    const registry = new EncryptedFileDeviceProvisioningRegistry(registryPath, keyPath)
    const record = await registry.findByClaimId(registeredClaimId)
    expect(record?.claimSecret.equals(secret)).toBe(true)

    const datasetPath = join(directory, 'dataset.hex')
    await writeFile(datasetPath, '00112233445566778899aabbccddeeff\n')
    expect((await new FileThreadDatasetProvider(datasetPath).getActiveOperationalDataset()).toString('hex'))
      .toBe('00112233445566778899aabbccddeeff')

    const transactionPath = join(directory, 'transactions.json')
    const store = new FileProvisioningTransactionStore(transactionPath)
    store.save([{ transactionId: '11111111-1111-4111-8111-111111111111', claimId: registeredClaimId,
      productId: 1, state: 'CLEANUP_PENDING', createdAtMs: 1, expiresAtMs: 2 }])
    expect(store.load()[0]?.state).toBe('CLEANUP_PENDING')
    expect((await stat(transactionPath)).mode & 0o777).toBe(0o600)
    expect(await readFile(transactionPath, 'utf8')).not.toContain('claim_secret')
    derived.fill(0)
    master.fill(0)
  })
})
