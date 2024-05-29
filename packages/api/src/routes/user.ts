import { router, userProcedure } from "@repo/api/trpc";
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
      const user = await db.user.update({ where: { id }, data });
      return _.omit(user, "password");
    }),
});
