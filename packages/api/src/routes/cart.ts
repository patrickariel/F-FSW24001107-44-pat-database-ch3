import { userProcedure, router } from "@bingle/api/trpc";
import { CartItemSchema, ProductSchema } from "@bingle/db";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export default router({
  list: userProcedure
    .meta({ openapi: { method: "GET", path: "/cart/list", protect: true } })
    .input(z.void())
    .output(z.array(CartItemSchema.merge(z.object({ product: ProductSchema }))))
    .query(
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
  get: userProcedure
    .meta({
      openapi: { method: "GET", path: "/cart/get/{id}", protect: true },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(CartItemSchema.nullable())
    .query(
      async ({
        input: { id: productId },
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
    .meta({ openapi: { method: "PATCH", path: "/cart/update", protect: true } })
    .input(
      z.object({
        items: z.array(
          z.object({ id: z.string().uuid(), quantity: z.number().min(1) }),
        ),
      }),
    )
    .output(z.array(CartItemSchema))
    .mutation(
      async ({
        input: { items },
        ctx: {
          user: { id: userId },
          db,
        },
      }) =>
        Promise.all(
          items.map(async ({ quantity, id: productId }) =>
            db.cartItem.update({
              data: { quantity },
              where: { userId_productId: { userId, productId } },
            }),
          ),
        ),
    ),
  remove: userProcedure
    .meta({
      openapi: { method: "DELETE", path: "/cart/remove/{id}", protect: true },
    })
    .input(z.object({ id: z.string().uuid() }))
    .output(z.void())
    .mutation(
      async ({
        input: { id: productId },
        ctx: {
          user: { id: userId },
          db,
        },
      }) => {
        await db.cartItem.deleteMany({
          where: {
            userId,
            productId,
          },
        });
      },
    ),
  add: userProcedure
    .meta({ openapi: { method: "POST", path: "/cart/add", protect: true } })
    .input(
      z.object({
        items: z.array(
          z.object({ id: z.string().uuid(), quantity: z.number().min(1) }),
        ),
      }),
    )
    .output(z.array(z.object({ product: ProductSchema, quantity: z.number() })))
    .mutation(async ({ input: { items }, ctx: { user, db } }) => {
      const products = items.map(async ({ id, quantity }) => {
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
