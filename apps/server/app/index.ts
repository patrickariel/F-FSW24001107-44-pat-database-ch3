import { appRouter } from "@repo/api";
import { createContext } from "@repo/api/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import chalk from "chalk";
import { config } from "dotenv";
import express from "express";
import figures from "figures";

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

app.listen(port, () => {
  console.log(
    `${chalk.green(figures.arrowRight)} Listening on ${chalk.cyan("http://localhost:")}${chalk.bold.cyanBright(port)}`,
  );
});
