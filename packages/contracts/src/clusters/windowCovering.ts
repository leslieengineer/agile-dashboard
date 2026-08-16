import { z } from 'zod'

export const GoToLiftPercentagePayloadSchema = z
  .object({ liftPercent100ths: z.number().int().min(0).max(10_000) })
  .strict()

export const GoToTiltPercentagePayloadSchema = z
  .object({ tiltPercent100ths: z.number().int().min(0).max(10_000) })
  .strict()
