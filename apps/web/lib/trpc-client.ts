import { getBaseUrl } from "./utils";
import type { AppRouter } from "@repo/api";
import { httpBatchLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import superjson from "superjson";

export const trpc = createTRPCNext<AppRouter>({
  config(opts) {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          async headers() {
            return {
              // authorization: getAuthCookie(),
            };
          },
          transformer: superjson,
        }),
      ],
    };
  },
  transformer: superjson,
  ssr: false,
});
