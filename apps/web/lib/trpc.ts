import { getBaseUrl } from "./utils";
import type { AppRouter } from "@repo/api";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { cookies } from "next/headers";

export default createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      async headers() {
        return {
          Cookie: cookies().toString(),
        };
      },
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        });
      },
    }),
  ],
});
