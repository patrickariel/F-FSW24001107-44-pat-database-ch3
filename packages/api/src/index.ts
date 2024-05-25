import { product } from "./routes/product";
import { createCallerFactory, router } from "./trpc";

export const appRouter = router({
  product,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
