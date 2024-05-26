import { publicProcedure, router, userProcedure } from "@repo/api/trpc";
import { prisma } from "@repo/db";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import _ from "lodash";
import { z } from "zod";

export const user = router({
  auth: publicProcedure
    .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
    .mutation(async (opts) => {
      const user = await prisma.user.findUnique({
        where: { email: opts.input.email },
      });

      if (user === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No such user in the database",
        });
      }

      if (await bcrypt.compare(opts.input.password, user.password)) {
        return _.omit(user, "password");
      } else {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid credentials",
        });
      }
    }),
  get: userProcedure
    .input(z.object({ id: z.string().uuid() }))
    .output(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input: { id } }) => {
      const user = await prisma.user.findUnique({
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
      _.omit(prisma.user.findUnique({ where: { email } }), "password"),
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
      const user = prisma.user.update({ where: { id }, data });
      if (user === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No such user in the database",
        });
      }
      return _.omit(user, "password");
    }),
});
