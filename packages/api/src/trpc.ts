import { type JWT, getToken } from "@auth/core/jwt";
import { type PrismaClient, db } from "@bingle/db";
import { TRPCError, initTRPC } from "@trpc/server";
import type * as trpcExpress from "@trpc/server/adapters/express";
import superjson from "superjson";

export async function createContext({
  req,
  res: _,
}: trpcExpress.CreateExpressContextOptions): Promise<{
  session: JWT | null;
  db: PrismaClient;
}> {
  let session: Awaited<ReturnType<typeof getToken>> | null = null;

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

    if (jwt?.exp && new Date() < new Date(jwt.exp * 1000)) {
      session = jwt;
    }
  }

  return { session, db };
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({ transformer: superjson });

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

export const publicProcedure = t.procedure;
export const optUserProcedure = t.procedure.use(
  async ({ ctx: { session, db }, next }) =>
    next({
      ctx: {
        user: session?.email
          ? await db.user.findUnique({
              where: { email: session.email },
              include: { cart: true },
            })
          : null,
        session,
        db,
      },
    }),
);
export const userProcedure = t.procedure.use(
  async ({ ctx: { session, db }, next }) => {
    if (!session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    } else {
      if (!session.email) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const user = await db.user.findUnique({
        where: { email: session.email },
        include: { cart: { include: { product: true } } },
      });

      if (!user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return next({ ctx: { user, session, db } });
    }
  },
);
