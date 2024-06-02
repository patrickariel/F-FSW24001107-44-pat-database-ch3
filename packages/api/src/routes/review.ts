import { publicProcedure, router } from "@bingle/api/trpc";
import { ReviewSchema } from "@bingle/db";
import { z } from "zod";

export const review = router({
  get: publicProcedure
    .meta({ openapi: { method: "GET", path: "/review/get/{id}" } })
    .input(z.object({ id: z.string().uuid() }))
    .output(ReviewSchema.nullable())
    .query(async ({ ctx: { db }, input: { id } }) =>
      db.review.findUnique({ where: { id } }),
    ),
  find: publicProcedure
    .meta({ openapi: { method: "POST", path: "/review/find" } })
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(25),
        cursor: z.string().uuid().nullish(),
        productId: z.string().uuid().optional(),
        authorId: z.string().uuid().optional(),
        minRating: z.number().optional(),
        maxRating: z.number().optional(),
      }),
    )
    .output(
      z.object({
        reviews: z.array(ReviewSchema),
        nextCursor: z.string().nullish(),
      }),
    )
    .query(
      async ({
        ctx: { db },
        input: { limit, cursor, productId, authorId, minRating, maxRating },
      }) => {
        const reviews = await db.review.findMany({
          where: {
            productId,
            authorId,
            rating: { gte: minRating, lte: maxRating },
          },
          take: limit + 1,
          cursor: cursor ? { id: cursor } : undefined,
        });

        let nextCursor: typeof cursor | undefined;

        if (reviews.length > limit) {
          const nextItem = reviews.pop();
          nextCursor = nextItem!.id; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- We know that products is not empty
        }

        return {
          reviews,
          nextCursor,
        };
      },
    ),
});
