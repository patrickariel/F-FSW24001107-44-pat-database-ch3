import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";

interface CreateContextOptions {}

export async function createContextInner(_opts: CreateContextOptions) {
  return {};
}

export async function createContext({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) {
  return await createContextInner({});
}

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;
