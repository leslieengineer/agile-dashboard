import { randomBytes, randomUUID } from 'node:crypto'
import {
  ClaimProofRequestSchema,
  ClaimProofResponseSchema,
  CommissioningSessionCreateRequestSchema,
  CommissioningSessionCreateResponseSchema,
  CommissioningSessionSchema,
  type ClaimProofRequest,
  type ClaimProofResponse,
  type CommissioningSession,
  type CommissioningSessionCreateRequest,
  type CommissioningSessionCreateResponse,
  type ProvisioningState,
} from '@agile/contracts'
import { decodeBase64Url, encodeBase64Url, encryptCommissioningGrant, verifyClaimProof } from './crypto.js'
import type { DeviceProvisioningRegistry, ThreadDatasetProvider } from './registry.js'

interface Transaction {
  transactionId: string
  claimId: string
  productId: number
  mobilePublicKey: string
  challenge: Buffer
  state: ProvisioningState
  createdAtMs: number
  expiresAtMs: number
  failedAttempts: number
  usedNonces: Set<string>
  temporaryNodeId?: string
  bbbNodeId?: string
  error?: { code: string; message: string; retryable: boolean }
}

export class ProvisioningServiceError extends Error {
  constructor(readonly code: string, message: string, readonly retryable = false) {
    super(message)
  }
}

export interface ProvisioningServiceOptions {
  transactionTtlMs?: number
  maxClaimAttempts?: number
  now?: () => number
}

export class ProvisioningService {
  private readonly transactions = new Map<string, Transaction>()
  private readonly activeByClaim = new Map<string, string>()
  private readonly ttlMs: number
  private readonly maxClaimAttempts: number
  private readonly now: () => number

  constructor(
    private readonly registry: DeviceProvisioningRegistry,
    private readonly datasetProvider: ThreadDatasetProvider,
    options: ProvisioningServiceOptions = {},
  ) {
    this.ttlMs = options.transactionTtlMs ?? 10 * 60 * 1000
    this.maxClaimAttempts = options.maxClaimAttempts ?? 5
    this.now = options.now ?? Date.now
  }

  async createSession(input: CommissioningSessionCreateRequest): Promise<CommissioningSessionCreateResponse> {
    const request = CommissioningSessionCreateRequestSchema.parse(input)
    this.expireTransactions()

    const record = await this.registry.findByClaimId(request.claim_id)
    if (!record || record.productId !== request.product_id) {
      record?.claimSecret.fill(0)
      throw new ProvisioningServiceError('INVALID_DEVICE', 'Device claim is not registered')
    }
    record.claimSecret.fill(0)

    const activeId = this.activeByClaim.get(request.claim_id)
    if (activeId && this.transactions.get(activeId)?.state !== 'CANCELLED') {
      throw new ProvisioningServiceError('TRANSACTION_CONFLICT', 'A provisioning transaction is already active', true)
    }

    const now = this.now()
    const transaction: Transaction = {
      transactionId: randomUUID(),
      claimId: request.claim_id,
      productId: request.product_id,
      mobilePublicKey: request.mobile_ephemeral_public_key,
      challenge: randomBytes(32),
      state: 'CLAIM_CHALLENGE',
      createdAtMs: now,
      expiresAtMs: now + this.ttlMs,
      failedAttempts: 0,
      usedNonces: new Set(),
    }
    this.transactions.set(transaction.transactionId, transaction)
    this.activeByClaim.set(transaction.claimId, transaction.transactionId)

    return CommissioningSessionCreateResponseSchema.parse({
      transaction_id: transaction.transactionId,
      challenge: encodeBase64Url(transaction.challenge),
      expires_at: new Date(transaction.expiresAtMs).toISOString(),
      state: 'CLAIM_CHALLENGE',
    })
  }

  async submitClaim(transactionId: string, input: ClaimProofRequest): Promise<ClaimProofResponse> {
    const request = ClaimProofRequestSchema.parse(input)
    const transaction = this.requireActive(transactionId, 'CLAIM_CHALLENGE')
    if (transaction.failedAttempts >= this.maxClaimAttempts) {
      throw new ProvisioningServiceError('CLAIM_RATE_LIMITED', 'Claim attempt limit reached')
    }

    const nonce = decodeBase64Url(request.device_nonce)
    const proof = decodeBase64Url(request.proof)
    if (nonce.length < 8 || nonce.length > 32) {
      throw new ProvisioningServiceError('CLAIM_INVALID', 'Invalid device nonce')
    }
    const nonceKey = request.device_nonce
    if (transaction.usedNonces.has(nonceKey)) {
      throw new ProvisioningServiceError('CLAIM_REPLAYED', 'Device nonce was already used')
    }
    transaction.usedNonces.add(nonceKey)

    const record = await this.registry.findByClaimId(transaction.claimId)
    if (!record || record.productId !== transaction.productId) {
      record?.claimSecret.fill(0)
      throw new ProvisioningServiceError('INVALID_DEVICE', 'Device claim is not registered')
    }

    const valid = verifyClaimProof(
      record.claimSecret,
      nonce,
      transaction.challenge,
      decodeBase64Url(transaction.claimId),
      proof,
    )
    proof.fill(0)
    nonce.fill(0)
    if (!valid) {
      record.claimSecret.fill(0)
      transaction.failedAttempts += 1
      throw new ProvisioningServiceError('CLAIM_INVALID', 'Device claim proof is invalid')
    }

    transaction.state = 'CLAIM_VERIFIED'
    const dataset = await this.datasetProvider.getActiveOperationalDataset()
    const expiresAt = new Date(transaction.expiresAtMs).toISOString()
    const plaintext = Buffer.from(JSON.stringify({
      version: 1,
      transaction_id: transaction.transactionId,
      expires_at: expiresAt,
      setup_passcode: record.setupPasscode,
      discriminator: record.discriminator,
      thread_operational_dataset: encodeBase64Url(dataset),
    }), 'utf8')

    const grant = encryptCommissioningGrant(
      transaction.mobilePublicKey,
      transaction.transactionId,
      expiresAt,
      plaintext,
    )
    plaintext.fill(0)
    dataset.fill(0)
    record.claimSecret.fill(0)
    transaction.state = 'GRANT_ISSUED'

    return ClaimProofResponseSchema.parse({
      transaction_id: transaction.transactionId,
      state: 'GRANT_ISSUED',
      grant,
    })
  }

  getSession(transactionId: string): CommissioningSession {
    const transaction = this.requireTransaction(transactionId)
    this.expireTransaction(transaction)
    return this.toPublicSession(transaction)
  }

  markThreadAttached(transactionId: string, temporaryNodeId: string): CommissioningSession {
    const transaction = this.requireActive(transactionId, 'GRANT_ISSUED')
    transaction.temporaryNodeId = temporaryNodeId
    transaction.state = 'TEMP_FABRIC_COMMISSIONED'
    return this.toPublicSession(transaction)
  }

  markWindowOpen(transactionId: string): CommissioningSession {
    const transaction = this.requireActive(transactionId, 'TEMP_FABRIC_COMMISSIONED')
    transaction.state = 'WINDOW_OPEN'
    return this.toPublicSession(transaction)
  }

  markBbbCommissioning(transactionId: string): CommissioningSession {
    const transaction = this.requireActive(transactionId, 'WINDOW_OPEN')
    transaction.state = 'BBB_FABRIC_COMMISSIONING'
    return this.toPublicSession(transaction)
  }

  markBbbFabricReady(transactionId: string, bbbNodeId: string): CommissioningSession {
    const transaction = this.requireActive(transactionId, 'BBB_FABRIC_COMMISSIONING')
    transaction.bbbNodeId = bbbNodeId
    transaction.state = 'TEMP_FABRIC_REMOVING'
    return this.toPublicSession(transaction)
  }

  complete(transactionId: string, temporaryFabricRemoved: boolean): CommissioningSession {
    const transaction = this.requireTransaction(transactionId)
    this.expireTransaction(transaction)
    if (!['TEMP_FABRIC_REMOVING', 'CLEANUP_PENDING'].includes(transaction.state)) {
      throw new ProvisioningServiceError('TRANSACTION_STATE_INVALID', `Cannot complete from ${transaction.state}`)
    }
    transaction.state = temporaryFabricRemoved ? 'COMPLETE' : 'CLEANUP_PENDING'
    if (temporaryFabricRemoved) {
      this.activeByClaim.delete(transaction.claimId)
      transaction.challenge.fill(0)
    }
    return this.toPublicSession(transaction)
  }

  cancel(transactionId: string): CommissioningSession {
    const transaction = this.requireTransaction(transactionId)
    if (transaction.state === 'COMPLETE') return this.toPublicSession(transaction)
    transaction.state = 'CANCELLED'
    transaction.challenge.fill(0)
    this.activeByClaim.delete(transaction.claimId)
    return this.toPublicSession(transaction)
  }

  private requireTransaction(transactionId: string): Transaction {
    const transaction = this.transactions.get(transactionId)
    if (!transaction) throw new ProvisioningServiceError('TRANSACTION_NOT_FOUND', 'Provisioning transaction not found')
    return transaction
  }

  private requireActive(transactionId: string, expected: ProvisioningState): Transaction {
    const transaction = this.requireTransaction(transactionId)
    this.expireTransaction(transaction)
    if (transaction.state === 'EXPIRED') {
      throw new ProvisioningServiceError('CLAIM_EXPIRED', 'Provisioning transaction expired')
    }
    if (transaction.state !== expected) {
      throw new ProvisioningServiceError('TRANSACTION_STATE_INVALID', `Expected ${expected}, found ${transaction.state}`)
    }
    return transaction
  }

  private expireTransactions(): void {
    for (const transaction of this.transactions.values()) this.expireTransaction(transaction)
  }

  private expireTransaction(transaction: Transaction): void {
    if (this.now() <= transaction.expiresAtMs || ['COMPLETE', 'CANCELLED', 'EXPIRED'].includes(transaction.state)) return
    transaction.state = 'EXPIRED'
    transaction.challenge.fill(0)
    this.activeByClaim.delete(transaction.claimId)
  }

  private toPublicSession(transaction: Transaction): CommissioningSession {
    const value: Record<string, unknown> = {
      transaction_id: transaction.transactionId,
      claim_id: transaction.claimId,
      product_id: transaction.productId,
      state: transaction.state,
      created_at: new Date(transaction.createdAtMs).toISOString(),
      expires_at: new Date(transaction.expiresAtMs).toISOString(),
    }
    if (transaction.temporaryNodeId !== undefined) value.temporary_node_id = transaction.temporaryNodeId
    if (transaction.bbbNodeId !== undefined) value.bbb_node_id = transaction.bbbNodeId
    if (transaction.error !== undefined) value.error = transaction.error
    return CommissioningSessionSchema.parse(value)
  }
}
