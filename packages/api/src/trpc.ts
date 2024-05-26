import { getToken } from "@auth/core/jwt";
import { prisma } from "@repo/db";
import { TRPCError, initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import superjson from "superjson";
import { z } from "zod";

export async function createContext({
  req,
  res: _,
}: trpcExpress.CreateExpressContextOptions) {
  let user;
  if (process.env.AUTH_SECRET && req.headers.cookie) {
    const jwt = await getToken({
      req: { headers: { cookie: req.headers.cookie } },
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
      salt:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
    });

    user = z
      .object({
        name: z.string(),
        email: z.string().email(),
        picture: z.string().url(),
        sub: z.string().uuid(),
        iat: z.number(),
        exp: z.number(),
        jti: z.string().uuid(),
      })
      .safeParse(jwt).data;

    if (user && new Date() > new Date(user.exp * 1000)) {
      user = undefined;
    } else if (user) {
      user = await prisma.user.findUnique({
        where: { email: user.email },
        include: { cart: true },
      });
    }
  }

  return { user };
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({ transformer: superjson });

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;
export const userProcedure = t.procedure.use(async (opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({
    ctx: {
      user: opts.ctx.user,
    },
  });
});
