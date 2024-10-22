import { idInput } from "@/input/base";
import { deleteGamesInput, gameInput, gameUpdateInput } from "@/input/game";
import { updateUserInput, userInput } from "@/input/user";
import { prisma } from "@/prisma";
import { Question } from "@prisma/client";
import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import bcrypt from "bcrypt";
import { Chess } from "chess.js";
import { deepStrictEqual } from "assert/strict";
import { submitQuestion } from "@/input/question";
import { loginInput } from "@/input/auth";
import jwt from "jsonwebtoken";

type UserJwt = {
  id: string;
  admin: boolean | null;
  username: string;
};

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return opts;
};

const t = initTRPC.context<typeof createContext>().create();

export const publicProcedure = t.procedure;

const authenticated = publicProcedure.use(
  t.middleware(async ({ ctx, next }) => {
    const bearer = ctx.req.headers.get("Authorization");
    if (!bearer) throw new TRPCError({ code: "UNAUTHORIZED" });
    const payload = jwt.verify(bearer, process.env.JWT_SECRET as string);
    return next({ ctx: { ...ctx, user: payload as UserJwt } });
  })
);

const adminProcedure = authenticated.use(({ ctx: { user }, next }) => {
  if (!user.admin) throw new TRPCError({ code: "FORBIDDEN" });
  return next();
});

async function newQuestion(gameId: string, pgn: string, questions: number[]) {
  const chess = new Chess();
  chess.loadPgn(pgn);
  const history = chess.history({ verbose: true });

  const start = questions[0] + 1;
  const stop = questions[questions.length - 1] + 1;
  const part = history.slice(start, stop);

  const created = await prisma.question.create({
    data: {
      gameId,
      afters: part.map((x) => x.after),
      befores: part.map((x) => x.before),
      moves: questions,
    },
  });

  return created;
}

export const appRouter = t.router({
  auth: {
    login: publicProcedure
      .input(loginInput)
      .mutation(async ({ input: { username, password } }) => {
        const user = await prisma.user.findFirst({ where: { username } });

        if (!user)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Wrong username or password",
          });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Wrong username or password",
          });

        return {
          admin: user.admin,
          token: jwt.sign(
            { id: user.id, admin: user.admin, username: user.username },
            process.env.JWT_SECRET as string
          ),
        };
      }),
    me: authenticated.query(async (opts) => {
      const user = await prisma.user.findFirstOrThrow({
        where: { id: opts.ctx.user.id },
      });

      return { ...user, password: undefined };
    }),
  },
  user: {
    createUser: adminProcedure
      .input(userInput)
      .mutation(async ({ input: { username, password, difficulty } }) => {
        try {
          const user = await prisma.user.create({
            data: {
              username,
              password: await bcrypt.hash(password, 12),
              difficulty,
            },
          });

          return { id: user.id };
        } catch (error: any) {
          if (error.code === "P2002")
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `'${username}' already registered`,
            });

          console.error(error);
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
      }),
    getUsers: adminProcedure.query(async () => {
      try {
        const users = await prisma.user.findMany({
          select: {
            password: false,
            id: true,
            username: true,
            score: true,
            solved: true,
            difficulty: true,
          },
        });

        return users;
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),
    getUser: adminProcedure.input(idInput).query(async ({ input: { id } }) => {
      try {
        const user = await prisma.user.findFirst({ where: { id } });
        return { ...user, password: undefined };
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),
    updateUser: adminProcedure
      .input(updateUserInput)
      .mutation(async ({ input: { difficulty, id } }) => {
        try {
          const user = await prisma.user.update({
            where: { id },
            data: { difficulty },
          });

          return user;
        } catch (error: any) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
      }),
    deleteUser: adminProcedure
      .input(idInput)
      .mutation(async ({ input: { id } }) => {
        try {
          const user = await prisma.user.delete({ where: { id } });
          return user;
        } catch (error: any) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
      }),
  },
  game: {
    createGame: adminProcedure
      .input(gameInput)
      .mutation(async ({ input: { pgn, description, questions } }) => {
        try {
          const game = await prisma.game.create({
            data: {
              pgn: pgn.trim(),
              description: description?.trim(),
              questions,
            },
          });

          for (const question of questions || []) {
            await newQuestion(game.id, pgn, question);
          }

          return { id: game.id };
        } catch (error: any) {
          console.error(error);
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
      }),
    updateGame: adminProcedure
      .input(gameUpdateInput)
      .mutation(async ({ input: { id, pgn, description, questions } }) => {
        try {
          const game = await prisma.game.findFirstOrThrow({
            where: { id },
            include: {
              Question: true,
            },
          });

          if (pgn !== game.pgn) {
            await prisma.question.deleteMany({ where: { gameId: game.id } }); // ! UNUTMA
            game.Question = [];
          }

          const dont_delete_questions = [];

          for (const question of questions || []) {
            const Question = game.Question.find(
              (x) => x.moves + "" === question + ""
            );

            if (Question) {
              dont_delete_questions.push(Question.id);
              continue;
            }

            const new_question = await newQuestion(game.id, pgn, question);
            dont_delete_questions.push(new_question.id);
          }

          await prisma.question.deleteMany({
            where: { gameId: game.id, id: { notIn: dont_delete_questions } },
          });

          const updated = await prisma.game.update({
            where: { id },
            data: {
              pgn: pgn.trim(),
              description: description?.trim(),
              questions,
            },
          });

          return { id: updated.id };
        } catch (error: any) {
          console.error(error);
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
      }),
    getGame: adminProcedure.input(idInput).query(async ({ input: { id } }) => {
      try {
        const game = await prisma.game.findFirstOrThrow({ where: { id } });
        return game;
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),
    getGames: adminProcedure.query(async () => {
      try {
        const games = await prisma.game.findMany();
        return games;
      } catch (error: any) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
      }
    }),
    deleteGames: adminProcedure
      .input(deleteGamesInput)
      .mutation(async ({ input }) => {
        try {
          await prisma.question.deleteMany({
            where: { gameId: { in: input } },
          });

          const games = await prisma.game.deleteMany({
            where: { id: { in: input } },
          });

          return games.count;
        } catch (error) {}
      }),
  },
  question: {
    getQuestion: authenticated.query(
      async ({
        ctx: {
          user: { id },
        },
      }) => {
        try {
          const currentAnswer = await prisma.answer.findFirst({
            where: { userId: id, completed: false },
          });

          if (currentAnswer) {
            const befores = currentAnswer.befores.slice(
              0,
              currentAnswer.answers.length + 1
            );

            for (
              let i = befores.length;
              i < currentAnswer.befores.length;
              i++
            ) {
              befores[i] = "";
            }

            for (let i = 1; i < currentAnswer.answers.length; i++) {
              befores[i] = currentAnswer.answers[i];
            }

            return { ...currentAnswer, afters: undefined, befores };
          }

          const user = await prisma.user.findFirstOrThrow({
            where: { id },
            include: { answers: true },
          });

          const question = await prisma.question.findFirstOrThrow({
            where: {
              id: {
                notIn: user?.answers.map((x) => x.questionId),
              },
              game: {
                difficulty: user.difficulty,
              },
            },
          });

          const answer = await prisma.answer.create({
            data: {
              questionId: question.id,
              afters: question.afters,
              befores: question.befores,
              userId: user.id,
            },
          });

          const befores = new Array(answer.befores.length).fill("");
          befores[0] = answer.befores[0];

          return { ...answer, afters: undefined, befores };
        } catch (error: any) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
      }
    ),
    submit: authenticated.input(submitQuestion).mutation(
      async ({
        input: { fen, id },
        ctx: {
          user: { id: userId },
        },
      }) => {
        try {
          const answer = await prisma.answer.update({
            where: { id, userId },
            data: { answers: { push: fen } },
          });

          if (
            answer.answers[answer.answers.length - 1] ===
            answer.afters[answer.answers.length - 1]
          ) {
            const user = await prisma.user.update({
              where: { id: userId },
              data: { score: { increment: 1 }, solved: { increment: 1 } },
            });

            const last_answer = answer.afters[answer.answers.length]
              ? await prisma.answer.update({
                  where: { id, userId },
                  data: {
                    answers: { push: answer.afters[answer.answers.length] },
                  },
                })
              : answer;

            if (last_answer.answers.length === last_answer.afters.length) {
              await prisma.answer.update({
                where: { id: answer.id },
                data: { completed: true },
              });
            }

            return {
              status: true,
              score: user.score,
            };
          }

          const user = await prisma.user.update({
            where: { id: userId },
            data: { solved: { increment: 1 } },
          });

          await prisma.answer.update({
            where: { id: answer.id },
            data: { completed: true },
          });

          return { status: false, score: user.score, fen: null };
        } catch (error: any) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
      }
    ),
    getAnswers: authenticated.query(
      async ({
        ctx: {
          user: { id: userId },
        },
      }) => {
        try {
          const answers = await prisma.answer.findMany({ where: { userId } });
          return answers;
        } catch (error: any) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
        }
      }
    ),
  },
});

export type AppRouter = typeof appRouter;
