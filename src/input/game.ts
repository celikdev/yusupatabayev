import { z } from "zod";
import { idInput } from "./base";
import { Difficulty } from "@prisma/client";

export const gameInput = z.object({
  pgn: z.string().min(1),
  description: z.string().optional(),
  questions: z.array(z.array(z.number())).optional(),
  difficulty: z.nativeEnum(Difficulty),
});

export const gameUpdateInput = gameInput.merge(idInput);

export const deleteGamesInput = z.array(z.string());
