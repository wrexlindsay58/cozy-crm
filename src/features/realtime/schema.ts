import { z } from "zod";

const patchSchema = z.record(z.string(), z.unknown());

export const recordUpdatedSchema = z.object({
  type: z.literal("record.updated"),
  channel: z.enum(["lead", "job", "membership"]),
  id: z.string().min(1),
  patch: patchSchema,
  by: z.string().optional(),
});

export const recordDeletedSchema = z.object({
  type: z.literal("record.deleted"),
  channel: z.enum(["lead", "job", "membership"]),
  id: z.string().min(1),
  by: z.string().optional(),
});

export const presenceSchema = z.object({
  type: z.literal("presence"),
  id: z.string().min(1),
  user: z.string().min(1),
  active: z.boolean(),
});

export const realtimeEventSchema = z.union([recordUpdatedSchema, recordDeletedSchema, presenceSchema]);

export type RealtimeEvent = z.infer<typeof realtimeEventSchema>;

export function parseRealtimeEvent(raw: string): RealtimeEvent | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = realtimeEventSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
