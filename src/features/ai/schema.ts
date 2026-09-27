import { z } from "zod";

export const aiStepSchema = z.object({
  type: z.literal("step"),
  id: z.string().min(1),
  label: z.string().min(1),
  status: z.enum(["running", "done", "error"]),
});

export const aiTokenSchema = z.object({
  type: z.literal("token"),
  text: z.string(),
});

export const aiDoneSchema = z.object({
  type: z.literal("done"),
  text: z.string().optional(),
});

export const aiErrorSchema = z.object({
  type: z.literal("error"),
  message: z.string().min(1),
});

export const aiEventSchema = z.union([aiStepSchema, aiTokenSchema, aiDoneSchema, aiErrorSchema]);

export type AIEvent = z.infer<typeof aiEventSchema>;

export function parseAIPayload(raw: string): AIEvent | null {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  const parsed = aiEventSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function readSSEData(block: string): string | null {
  const data = block
    .split("\n")
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n")
    .trim();
  return data || null;
}
