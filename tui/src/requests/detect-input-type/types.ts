import { z } from "zod";

export const inputTypeSchema = z.union([
  z.literal("url"),
  z.literal("file_path"),
  z.literal("raw_text"),
]);

export const resultSchema = z.object({
  input_type: inputTypeSchema,
});

export type InputType = z.infer<typeof inputTypeSchema>;

export type ResultWire = z.infer<typeof resultSchema>;
