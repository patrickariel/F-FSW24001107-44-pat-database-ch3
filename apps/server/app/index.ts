import { appRouter, openApiDocument } from "@repo/api";
import { createContext } from "@repo/api/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import chalk from "chalk";
import { config } from "dotenv";
import express from "express";
import figures from "figures";
import { serve, setup } from "swagger-ui-express";
// eslint-disable-next-line import/no-extraneous-dependencies -- trpc-openapi has to be specified in the root package.json due to a npm bug with the "overrides" key
import { createOpenApiExpressMiddleware } from "trpc-openapi";

config({ path: [".env.local", ".env"] });

const app = express();
const port = process.env.EXPRESS_PORT || 4000;

app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use(
  "/docs",
  serve,
  setup(openApiDocument, {
    customCssUrl:
      "https://cdn.jsdelivr.net/gh/Amoenus/SwaggerDark@2064ccd/SwaggerDark.css",
  }),
);

app.use(
  "/",
  // eslint-disable-next-line @typescript-eslint/no-misused-promises -- TODO: Fix this later
  createOpenApiExpressMiddleware({
    router: appRouter,
    createContext,
    responseMeta: null,
    onError: null,
    maxBodySize: null,
  }),
);

app.listen(port, () => {
  console.log(
    `${chalk.green(figures.arrowRight)} Listening on ${chalk.cyan("http://localhost:")}${chalk.bold.cyanBright(port)}`,
  );
});
