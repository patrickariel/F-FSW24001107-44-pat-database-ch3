import { router, userProcedure } from "@repo/api/trpc";
import { db } from "@repo/db";
import { TRPCError } from "@trpc/server";
import _ from "lodash";
import { z } from "zod";

export const user = router({
  get: userProcedure
    .input(z.object({ id: z.string().uuid() }))
    .output(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input: { id } }) => {
      const user = await db.user.findUnique({
        where: { id },
      });
      if (user === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No such user in the database",
        });
      }
      return _.omit(user, "password");
    }),
  getByEmail: userProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input: { email } }) =>
      _.omit(db.user.findUnique({ where: { email } }), "password"),
    ),
  update: userProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().optional(),
        name: z.string().optional(),
        emailVerified: z.date().optional(),
      }),
    )
    .mutation(async ({ input: { id, ...data } }) => {
      const user = db.user.update({ where: { id }, data });
      if (user === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No such user in the database",
        });
      }
      return _.omit(user, "password");
    }),
});
