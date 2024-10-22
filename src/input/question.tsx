import { z } from "zod";
import { idInput } from "./base";

export const submitQuestion = idInput.merge(
  z.object({
    fen: z.string(),
  })
);
