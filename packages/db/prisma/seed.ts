import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import async from "async";
import * as bcrypt from "bcrypt";
import _ from "lodash";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: "john.smith@bling.com",
      name: "John Smith",
      password: await bcrypt.hash("password", 10),
      image: faker.image.avatarGitHub(),
      balance: _.random(1_000_000, 5_000_000),
    },
  });

  const extraUsers = await prisma.user.createManyAndReturn({
    data: await async.map(_.range(0, 100), async () => ({
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: await bcrypt.hash("password", 10),
      image: faker.image.avatarGitHub(),
      balance: _.random(1_000_000, 5_000_000),
    })),
  });

  const products = await prisma.product.createManyAndReturn({
    data: _.range(0, 2500).map(() => ({
      name: faker.commerce.productName(),
      images: _.range(0, 5).map(() =>
        faker.image.urlPicsumPhotos({ width: 1200, height: 900 }),
      ),
      department: faker.commerce.department(),
      price: parseFloat(faker.commerce.price()),
      stock: _.random(1, 32),
      description: faker.lorem.paragraphs(5),
      adjective: faker.commerce.productAdjective(),
      shortName: faker.commerce.product(),
      material: faker.commerce.productMaterial(),
    })),
  });

  await prisma.review.createManyAndReturn({
    data: _.flatten(
      products.map((product) =>
        _.range(0, _.random(20, 50)).map(() => ({
          authorId: _.sample(extraUsers)!.id,
          productId: product.id,
          review: faker.lorem.paragraphs(5),
          rating: _.sample([3.0, 3.5, 4.0, 4.5, 5.0]),
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
