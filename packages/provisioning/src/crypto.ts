import {
  createCipheriv,
  createHmac,
  createPublicKey,
  diffieHellman,
  generateKeyPairSync,
  hkdfSync,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'
import type { EncryptedCommissioningGrant } from '@agile/contracts'

export function decodeBase64Url(value: string): Buffer {
  return Buffer.from(value, 'base64url')
}

export function encodeBase64Url(value: Uint8Array): string {
  return Buffer.from(value).toString('base64url')
}

export function computeClaimProof(secret: Uint8Array, nonce: Uint8Array, challenge: Uint8Array, claimId: Uint8Array): Buffer {
  return createHmac('sha256', secret).update(nonce).update(challenge).update(claimId).digest()
}

export function verifyClaimProof(
  secret: Uint8Array,
  nonce: Uint8Array,
  challenge: Uint8Array,
  claimId: Uint8Array,
  proof: Uint8Array,
): boolean {
  const expected = computeClaimProof(secret, nonce, challenge, claimId)
  const candidate = Buffer.from(proof)
  const valid = candidate.length === expected.length && timingSafeEqual(candidate, expected)
  expected.fill(0)
  return valid
}

export function encryptCommissioningGrant(
  mobilePublicKey: string,
  transactionId: string,
  expiresAt: string,
  plaintext: Uint8Array,
): EncryptedCommissioningGrant {
  const mobileKey = createPublicKey({ key: decodeBase64Url(mobilePublicKey), format: 'der', type: 'spki' })
  const serverKeys = generateKeyPairSync('x25519')
  const sharedSecret = diffieHellman({ privateKey: serverKeys.privateKey, publicKey: mobileKey })
  const salt = Buffer.from(transactionId, 'utf8')
  const info = Buffer.from('rhophi-provisioning-v1', 'utf8')
  const key = Buffer.from(hkdfSync('sha256', sharedSecret, salt, info, 32))
  const nonce = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, nonce)
  cipher.setAAD(Buffer.from(transactionId, 'utf8'))
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()
  const serverPublicKey = serverKeys.publicKey.export({ type: 'spki', format: 'der' })

  key.fill(0)
  sharedSecret.fill(0)

  return {
    version: 1,
    algorithm: 'X25519-HKDF-SHA256-AES-256-GCM',
    server_ephemeral_public_key: encodeBase64Url(serverPublicKey),
    nonce: encodeBase64Url(nonce),
    ciphertext: encodeBase64Url(ciphertext),
    authentication_tag: encodeBase64Url(tag),
    transaction_id: transactionId,
    expires_at: expiresAt,
  }
}
