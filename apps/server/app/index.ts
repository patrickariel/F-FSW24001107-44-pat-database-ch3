import { appRouter } from "@repo/api";
import { createContext } from "@repo/api/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import express from "express";

const app = express();
const port = process.env.PORT || 4000;

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
