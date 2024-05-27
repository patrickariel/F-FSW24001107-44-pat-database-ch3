import { product } from "./routes/product";
import { user } from "./routes/user";
import { createCallerFactory, router } from "./trpc";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export const appRouter = router({
  product,
  user,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
