import { Prisma, PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

interface SelectMap {
  User: Prisma.UserSelect;
  Game: Prisma.GameSelect;
  Answer: Prisma.AnswerSelect;
}

interface PayloadMap<S extends string | number | symbol> {
  User: Prisma.UserGetPayload<{ [K in S]: true }>;
  Game: Prisma.GameGetPayload<{ [K in S]: true }>;
  Answer: Prisma.AnswerGetPayload<{ [K in S]: true }>;
}

export type FullModel<
  M extends keyof SelectMap,
  S = Required<SelectMap[M]>
> = PayloadMap<keyof S>[M];

export type UserModel = FullModel<"User">;
export type GameModel = FullModel<"Game">;
export type AnswerModel = FullModel<"Answer">;
