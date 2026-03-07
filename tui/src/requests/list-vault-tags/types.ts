import { z } from "zod";

export const resultSchema = z.object({
  tags: z.array(z.string()),
});

export type ResultWire = z.infer<typeof resultSchema>;
