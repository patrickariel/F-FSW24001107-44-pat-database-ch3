import { userProcedure, router } from "@repo/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export default router({
  list: userProcedure.query(
    async ({
      ctx: {
        user: { id: userId },
        db,
      },
    }) =>
      db.cartItem.findMany({
        where: { userId },
        include: { product: true },
        orderBy: { added: "desc" },
      }),
  ),
  get: userProcedure.input(z.object({ productId: z.string().uuid() })).query(
    async ({
      input: { productId },
      ctx: {
        user: { id: userId },
        db,
      },
    }) =>
      db.cartItem.findUnique({
        where: {
          userId_productId: {
            productId,
            userId,
          },
        },
        include: { product: true },
      }),
  ),
  update: userProcedure
    .input(
      z.array(z.object({ id: z.string().uuid(), quantity: z.number().min(1) })),
    )
    .mutation(
      async ({
        input,
        ctx: {
          user: { id: userId },
          db,
        },
      }) =>
        Promise.all(
          input.map(async ({ quantity, id: productId }) =>
            db.cartItem.update({
              data: { quantity },
              where: { userId_productId: { userId, productId } },
            }),
          ),
        ),
    ),
  remove: userProcedure
    .input(z.array(z.object({ id: z.string().uuid() })))
    .mutation(
      ({
        input: ids,
        ctx: {
          user: { id: userId },
          db,
        },
      }) =>
        db.cartItem.deleteMany({
          where: {
            userId,
            productId: { in: ids.map(({ id }) => id) },
          },
        }),
    ),
  add: userProcedure
    .input(
      z.array(z.object({ id: z.string().uuid(), quantity: z.number().min(1) })),
    )
    .mutation(async ({ input, ctx: { user, db } }) => {
      const products = input.map(async ({ id, quantity }) => {
        const product = await db.product.findUnique({
          where: { id },
        });

        if (product === null) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `The product with the following id was not found: ${id}`,
          });
        } else if (product.stock === 0) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: `${product.name} has been sold out.`,
          });
        } else {
          const inCart = user.cart.find(({ productId }) => productId === id);

          if (inCart) {
            if (inCart.quantity === product.stock) {
              throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: `All ${product.stock} ${product.name} ${product.stock > 1 ? "are" : "is"} in your cart`,
              });
            } else if (inCart.quantity + quantity > product.stock) {
              throw new TRPCError({
                code: "PRECONDITION_FAILED",
                message: `Can't add any more ${product.name} to your cart`,
              });
            } else {
              await db.cartItem.update({
                where: {
                  userId_productId: {
                    productId: product.id,
                    userId: user.id,
                  },
                },
                data: {
                  quantity: inCart.quantity + quantity,
                },
              });
              return {
                product,
                quantity: inCart.quantity + quantity,
              };
            }
          } else if (quantity > product.stock) {
            throw new TRPCError({
              code: "PRECONDITION_FAILED",
              message: `Not enough ${product.name} in stock`,
            });
          } else {
            await db.cartItem.create({
              data: {
                userId: user.id,
                productId: product.id,
                quantity,
              },
            });
            return { product, quantity };
          }
        }
      });

      return Promise.all(products);
    }),
});
