import { publicProcedure, router } from "../trpc";
import { db } from "@repo/db";
import z from "zod";

export const departments = [
  "Automotive",
  "Baby",
  "Beauty",
  "Books",
  "Clothing",
  "Computers",
  "Electronics",
  "Games",
  "Garden",
  "Grocery",
  "Health",
  "Home",
  "Industrial",
  "Jewelry",
  "Kids",
  "Movies",
  "Music",
  "Outdoors",
  "Shoes",
  "Sports",
  "Tools",
  "Toys",
] as const;

export const product = router({
  get: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input: { id }, ctx: { user } }) => {
      const product = await db.product.findUnique({ where: { id } });
      return product !== null
        ? {
            cart: user?.cart?.find(({ productId }) => productId === product.id),
            ...product,
          }
        : null;
    }),
  find: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(25),
        cursor: z.string().uuid().nullish(),
        department: z.enum(departments).optional(),
        query: z.string().optional(),
      }),
    )
    .query(
      async ({
        input: { department, limit, cursor, query },
        ctx: { user },
      }) => {
        const products = (
          await db.product.findMany({
            where: {
              ...(department && { department }),
              ...(query && { name: { search: query } }),
            },
            ...(limit && { take: limit + 1 }),
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: {
              added: "desc",
            },
          })
        ).map((product) => ({
          ...product,
          cart: user?.cart?.find(({ productId }) => productId === product.id),
        }));

        let nextCursor: typeof cursor | undefined = undefined;

        if (products.length > limit) {
          const nextItem = products.pop();
          nextCursor = nextItem!.id;
        }

        return {
          products,
          nextCursor,
        };
      },
    ),
});
