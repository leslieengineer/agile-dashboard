import { z } from 'zod'

export const MoveToLevelPayloadSchema = z
  .object({
    level: z.number().int().min(0).max(254),
    transitionTime: z.number().int().min(0).max(0xfffe).optional(),
  })
  .strict()

export const MovePayloadSchema = z
  .object({
    moveMode: z.number().int().min(0).max(1),
    rate: z.number().int().min(0).max(254).optional(),
  })
  .strict()

export const StepPayloadSchema = z
  .object({
    stepMode: z.number().int().min(0).max(1),
    stepSize: z.number().int().min(0).max(254),
    transitionTime: z.number().int().min(0).max(0xfffe).optional(),
  })
  .strict()
