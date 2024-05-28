import { router, userProcedure } from "@repo/api/trpc";
import { TRPCError } from "@trpc/server";
import _ from "lodash";
import { z } from "zod";

export const user = router({
  get: userProcedure.query(({ ctx: { user } }) => user),
  update: userProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().optional(),
        name: z.string().optional(),
        emailVerified: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx: { db }, input: { id, ...data } }) => {
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
