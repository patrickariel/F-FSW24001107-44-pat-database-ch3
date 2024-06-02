import { appRouter, openApiDocument } from "@bingle/api";
import { createContext } from "@bingle/api/trpc";
import * as trpcExpress from "@trpc/server/adapters/express";
import chalk from "chalk";
import { config } from "dotenv";
import express from "express";
import type { Response, Request, NextFunction } from "express";
import figures from "figures";
import { serve, generateHTML } from "swagger-ui-express";
import type {
  JsonObject,
  SwaggerUiOptions,
  SwaggerOptions,
} from "swagger-ui-express";
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

function setup(
  swaggerDoc?: JsonObject,
  opts?: SwaggerUiOptions,
  options?: SwaggerOptions,
  customCss?: string,
  customfavIcon?: string,
  swaggerUrl?: string,
  customSiteTitle?: string,
): (
  req: Request & { swaggerDoc?: JsonObject },
  res: Response,
  next: NextFunction,
) => void {
  return (req, res) => {
    const html = generateHTML(
      req.swaggerDoc ? req.swaggerDoc : swaggerDoc,
      opts,
      options,
      customCss,
      customfavIcon,
      swaggerUrl,
      customSiteTitle,
    );

    res.send(
      html
        .replace(
          /\.\/(?<file>swagger-ui.*?\.(?:js|css))/g,
          (_, file) => `./docs/${file}`,
        )
        .replace(
          /\.\/(?<icon>favicon-.*?\.png)/g,
          (_, icon) => `./docs/${icon}`,
        ),
    );
  };
}

app.use(
  "/docs",
  serve,
  setup(openApiDocument, {
    customCssUrl:
      "https://cdn.jsdelivr.net/gh/ravisankarchinnam/openapi-swagger-dark-theme@26ad321/dark-theme.css",
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
