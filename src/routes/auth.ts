import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../lib/prisma";
import { authenticate } from "../plugins/authenticate";
export async function authRoutes(fastify: FastifyInstance) {
  //-----GET-----
  fastify.get(
    "/me",
    {
      onRequest: [authenticate],
    },
    async (req) => {
      return {
        user: req.user,
      };
    }
  );
  //-----POST-----
  fastify.post("/users", async (req, res) => {
    const createUserBody = z.object({
      access_token: z.string(),
    });
    const { access_token } = createUserBody.parse(req.body);

    const userResponseAwait = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const userData = await userResponseAwait.json();

    const useInfoSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    });

    const userInfo = useInfoSchema.parse(userData);

    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id,
      },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarURl: userInfo.picture,
        },
      });
    }
    const token = fastify.jwt.sign(
      {
        name: user.name,
        avatarURl: user.avatarURl,
      },
      {
        sub: user.id,
        expiresIn: "7 days",
      }
    );
    return { token };
  });
}
