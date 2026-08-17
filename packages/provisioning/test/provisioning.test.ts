import {
  createDecipheriv,
  createPublicKey,
  diffieHellman,
  generateKeyPairSync,
  hkdfSync,
  type KeyObject,
} from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  computeClaimProof,
  decodeBase64Url,
  encodeBase64Url,
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
