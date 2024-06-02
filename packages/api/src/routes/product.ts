import { optUserProcedure, router, userProcedure } from "@bingle/api/trpc";
import { CartItemSchema, ProductSchema } from "@bingle/db";
import { z } from "zod";

export const product = router({
  get: optUserProcedure
    .meta({ openapi: { method: "GET", path: "/product/get/{id}" } })
    .input(
      z.object({
        id: z.string().uuid(),
        reviewMeta: z.boolean().default(false),
      }),
    )
    .output(
      ProductSchema.merge(
        z.object({
          cart: CartItemSchema.optional(),
          reviews: z
            .object({ average: z.number(), total: z.number() })
            .optional(),
        }),
      ).nullable(),
    )
    .query(async ({ input: { id, reviewMeta }, ctx: { db, user } }) => {
      const product = await db.product.findUnique({ where: { id } });
      return product !== null
        ? {
            ...product,
            cart: user?.cart.find(({ productId }) => productId === product.id),
            reviews: reviewMeta
              ? (
                  await db.review.groupBy({
                    by: ["productId"],
                    where: { productId: product.id },
                    _avg: { rating: true },
                    _count: true,
                  })
                ).map((review) => ({
                  average: review._avg.rating ?? 0,
                  total: review._count,
                }))[0]
              : undefined,
          }
        : null;
    }),
  add: userProcedure
    .meta({ openapi: { method: "POST", path: "/product/add" } })
    .input(
      z.object({
        name: z.string(),
        weight: z.number().min(0.1),
        manufacturer: z.string(),
        department: z.string(),
        price: z.number(),
        stock: z.number(),
        images: z.array(z.string().url()).min(1),
        description: z.string(),
      }),
    )
    .output(
      ProductSchema.merge(
        z.object({ images: z.array(z.string().url()).min(1) }),
      ),
    )
    .mutation(async ({ ctx: { db, user }, input: data }) =>
      db.product.create({ data: { ...data, userId: user.id } }),
    ),
  find: optUserProcedure
    .meta({ openapi: { method: "POST", path: "/product/find" } })
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(25),
          cursor: z.string().uuid().nullish(),
          department: z.string().nullish(),
          query: z.string().nullish(),
          sort: z.enum(["price", "added", "relevance"]).nullish(),
          order: z.enum(["desc", "asc"]).nullish(),
          minPrice: z.number().nullish(),
          maxPrice: z.number().nullish(),
          minRating: z.number().nullish(),
          maxRating: z.number().nullish(),
          reviewMeta: z.boolean().default(false),
        })
        .transform(
          (
            obj,
          ): typeof obj & {
            sort: "price" | "added" | "relevance";
            order: "asc" | "desc";
          } => {
            const transformed = {
              ...obj,
              ...(obj.query && { query: obj.query.split(/\s+/).join(" & ") }),
              sort: obj.sort ?? "added",
              order: obj.order ?? "desc",
            };
            if (!obj.sort && obj.query) {
              transformed.sort = "relevance";
            }
            return transformed;
          },
        ),
    )
    .output(
      z.object({
        products: z.array(
          ProductSchema.merge(
            z.object({
              cart: CartItemSchema.optional(),
              reviews: z
                .object({ average: z.number(), total: z.number() })
                .optional(),
            }),
          ),
        ),
        nextCursor: z.string().nullish(),
      }),
    )
    .query(
      async ({
        input: {
          department,
          limit,
          cursor,
          query,
          sort,
          order,
          minPrice,
          maxPrice,
          minRating,
          maxRating,
          reviewMeta,
        },
        ctx: { db, user },
      }) => {
        const productPromises = (
          await db.product.findMany({
            where: {
              ...(department && department !== "All" && { department }),
              name: { search: query ?? undefined },
              description: { search: query ?? undefined },
              price: {
                gte: minPrice ?? undefined,
                lte: maxPrice ?? undefined,
              },
              ...((minRating || maxRating) && {
                id: {
                  in: (
                    await db.review.groupBy({
                      by: ["productId"],
                      having: {
                        rating: {
                          _avg: {
                            ...(minRating && { gte: minRating }),
                            ...(maxRating && { lte: maxRating }),
                          },
                        },
                      },
                    })
                  ).map((review) => review.productId),
                },
              }),
            },
            orderBy:
              query && sort === "relevance"
                ? {
                    _relevance: {
                      fields: ["name", "description"],
                      search: query,
                      sort: order,
                    },
                  }
                : { [sort === "relevance" ? "added" : sort]: order },
            take: limit + 1,
            cursor: cursor ? { id: cursor } : undefined,
          })
        ).map(async (product) => ({
          ...product,
          cart: user?.cart.find(({ productId }) => productId === product.id),
          reviews: reviewMeta
            ? (
                await db.review.groupBy({
                  by: ["productId"],
                  where: { productId: product.id },
                  _avg: { rating: true },
                  _count: true,
                })
              ).map((review) => ({
                average: review._avg.rating ?? 0,
                total: review._count,
              }))[0]
            : undefined,
        }));

        const products = await Promise.all(productPromises);

        let nextCursor: typeof cursor | undefined;

        if (products.length > limit) {
          const nextItem = products.pop();
          nextCursor = nextItem!.id; // eslint-disable-line @typescript-eslint/no-non-null-assertion -- We know that products is not empty
        }

        return {
          products,
          nextCursor,
        };
      },
    ),
});
