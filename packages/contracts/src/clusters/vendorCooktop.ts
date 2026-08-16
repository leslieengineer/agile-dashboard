import { z } from 'zod'

export const VendorPayloadSchema = z
  .object({ vendor_id: z.number().int().min(1).max(0xffff) })
  .strict()

export const SetZonePowerPayloadSchema = z
  .object({
    vendor_id: z.number().int().min(1).max(0xffff),
    zone: z.number().int().min(0).max(3),
    powerLevel: z.number().int().min(0).max(9),
  })
  .strict()

export const SetBoostPayloadSchema = z
  .object({
    vendor_id: z.number().int().min(1).max(0xffff),
    zone: z.number().int().min(0).max(3),
    enabled: z.boolean(),
  })
  .strict()

export const LockPanelPayloadSchema = z
  .object({
    vendor_id: z.number().int().min(1).max(0xffff),
    locked: z.boolean(),
  })
  .strict()
