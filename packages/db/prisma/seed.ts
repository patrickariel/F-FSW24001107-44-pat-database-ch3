import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import _ from "lodash";

const prisma = new PrismaClient();

function randomWeighted(
  strength: number,
  min: number,
  max: number,
  toMax?: boolean,
): number {
  return (
    Math.pow(Math.random(), toMax ? 1 / strength : strength) * (max - min) + min
  );
}

async function main(): Promise<void> {
  await prisma.user.create({
    data: {
      email: "john.smith@bingle.com",
      name: "John Smith",
      password: await bcrypt.hash("password", 10),
      image: faker.image.avatarGitHub(),
      balance: 8500,
    },
  });

  const foo = _.range(0, 100).map((i) => {});

  const extraUsers = await prisma.user.createManyAndReturn({
    data: _.range(0, 100).map((i) => ({
      email: faker.internet.email({
        lastName: `${faker.person.lastName}${i}`,
      }),
      name: faker.person.fullName(),
      password: bcrypt.hashSync("password", 10),
      image: faker.image.avatarGitHub(),
      balance: _.random(2000, 9000),
    })),
  });

  const products = await prisma.product.createManyAndReturn({
    data: _.range(0, 2500).map(() => ({
      name: faker.commerce.productName(),
      images: _.range(0, 4).map(() =>
        faker.image.urlPicsumPhotos({ width: 1200, height: 900 }),
      ),
      added: faker.date.between({
        from: "2007-01-01T00:00:00.000Z",
        to: "2024-01-01T00:00:00.000Z",
      }),
      department: faker.commerce.department(),
      price: _.random(0.1, 35, true),
      stock: _.random(1, 32),
      description: faker.lorem.paragraphs(5),
      weight: _.random(1, 1000, true),
      manufacturer: faker.company.name(),
      userId: _.sample(extraUsers)!.id, // eslint-disable-line @typescript-eslint/no-non-null-assertion -- We know that extraUsers is not empty
    })),
  });

  await prisma.review.createManyAndReturn({
    data: _.flatten(
      products.map((product) =>
        _.range(0, _.random(20, 50)).map(() => ({
          authorId: _.sample(extraUsers)!.id, // eslint-disable-line @typescript-eslint/no-non-null-assertion -- We know that extraUsers is not empty
          productId: product.id,
          review: faker.lorem.paragraphs(5),
          rating: randomWeighted(3, 0.5, 5.0, true),
        })),
      ),
    ),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
