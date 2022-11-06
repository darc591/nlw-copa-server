import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";

export async function gameRoutes(fastify: FastifyInstance) {
  //-----GET-----
  fastify.get(
    "/pools/:id/games",
    { onRequest: [authenticate] },
    async (request, reply) => {
      const getParams = z.object({
        id: z.string(),
      });
      const { id } = getParams.parse(request.params);

      const games = await prisma.game.findMany({
        orderBy: {
          date: "desc",
        },
        include: {
          guesses: {
            where: {
              participant: {
                userId: request.user.sub,
                poolId: id,
              },
            },
          },
        },
      });
      return {
        games: games.map((game) => {
          return {
            ...game,
            guess: game.guesses[0] || null,
            guesses: undefined,
          };
        }),
      };
    }
  );
}
