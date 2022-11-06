import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Pedro",
      email: "pedro@prisma.com",
      avatarURl: "https://github.com/darc591.png",
    },
  });
  const pool = await prisma.pool.create({
    data: {
      title: "Example pool",
      code: "BOL123",
      ownerId: user.id,
      participants: {
        create: {
          userId: user.id,
        },
      },
    },
  });

  await prisma.game.create({
    data: {
      date: "2022-11-05T15:00:30.408Z",
      firstTeamCountryCode: "DE",
      secondTeamCountryCode: "BR",
    },
  });

  await prisma.game.create({
    data: {
      date: "2022-11-06T15:00:30.408Z",
      firstTeamCountryCode: "BR",
      secondTeamCountryCode: "VE",

      guesses: {
        create: {
          firstTeamPoints: 4,
          secondTeamPoints: 2,
          participant: {
            connect: {
              userId_poolId: {
                userId: user.id,
                poolId: pool.id,
              },
            },
          },
        },
      },
    },
  });
}

main();
