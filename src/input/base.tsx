import { z } from "zod";

export const idInput = z.object({
  id: z.string().regex(/^[0-9a-f]{24}$/),
});
