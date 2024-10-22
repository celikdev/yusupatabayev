import { Difficulty } from "@prisma/client";
import { z } from "zod";
import { idInput } from "./base";

export const userInput = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
  difficulty: z.nativeEnum(Difficulty),
});

export const updateUserInput = idInput.extend({
  difficulty: z.nativeEnum(Difficulty),
});
