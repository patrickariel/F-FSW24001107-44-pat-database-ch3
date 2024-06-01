import { version } from "../package.json";
import cart from "./routes/cart";
import { product } from "./routes/product";
import { review } from "./routes/review";
import { user } from "./routes/user";
import { createCallerFactory, router } from "./trpc";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
// eslint-disable-next-line import/no-extraneous-dependencies -- trpc-openapi has to be specified in the root package.json due to a npm bug with the "overrides" key
import { generateOpenApiDocument } from "trpc-openapi";

export const appRouter = router({
  product,
  user,
  cart,
  review,
});

export function getBaseUrl(): string {
  if (typeof window !== "undefined") return "";
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.RENDER_INTERNAL_HOSTNAME)
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;

  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Bingle Shop",
  version,
  baseUrl: `${getBaseUrl()}/api`,
});

export const createCaller = createCallerFactory(appRouter);

export type AppRouter = typeof appRouter;
export type RouterInput = inferRouterInputs<AppRouter>;
export type RouterOutput = inferRouterOutputs<AppRouter>;
