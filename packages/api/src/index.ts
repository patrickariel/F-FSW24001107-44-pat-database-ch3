import { createCallerFactory, publicProcedure, router } from "./trpc";
import { z } from "zod";

export const appRouter = router({
  greet: publicProcedure.input(z.string()).query(async ({ input }) => {
    return `Hello, ${input}`;
  }),
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
