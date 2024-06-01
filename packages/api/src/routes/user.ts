import { router, userProcedure } from "@bingle/api/trpc";
import { UserSchema } from "@bingle/db";
import _ from "lodash";
import { z } from "zod";

export const user = router({
  get: userProcedure
    .meta({ openapi: { method: "GET", path: "/user/get", protect: true } })
    .input(z.void())
    .output(UserSchema.omit({ password: true }))
    .query(({ ctx: { user } }) => _.omit(user, "password")),
  update: userProcedure
    .meta({ openapi: { method: "PATCH", path: "/user/update", protect: true } })
    .input(
      z.object({
        id: z.string(),
        email: z.string().optional(),
        name: z.string().optional(),
        emailVerified: z.date().optional(),
      }),
    )
    .output(UserSchema.omit({ password: true }))
    .mutation(async ({ ctx: { db }, input: { id, ...data } }) => {
      const user = await db.user.update({ where: { id }, data });
      return _.omit(user, "password");
    }),
});
