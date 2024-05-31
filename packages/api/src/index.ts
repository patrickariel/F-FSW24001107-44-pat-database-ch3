import cart from "./routes/cart";
import { product } from "./routes/product";
import { review } from "./routes/review";
import { user } from "./routes/user";
import { createCallerFactory, router } from "./trpc";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

export const appRouter = router({
  product,
  user,
  cart,
  review,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
