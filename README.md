# 🛍️ Bingle Shop

A super generic e-commerce exercise made with 100% pure spaghetti 🍝.

## 🔍 What's inside?

This repository includes the following packages/apps:

- `server`: an [Express](https://expressjs.com) server
- `web`: a [Next.js](https://nextjs.org) app with [Auth.js](https://authjs.dev) for authentication
- `@bingle/db`: [PostgreSQL](https://www.postgresql.org) database client powered with [Prisma](https://www.prisma.io)
- `@bingle/api`: API routes built with [tRPC](https://trpc.io) with an optional REST compatibility layer thanks to [trpc-openapi](https://github.com/jlalmes/trpc-openapi)
- `@bingle/ui`: a collection of React components filled mostly with [shadcn](https://ui.shadcn.com) components
- `@bingle/eslint-config`: `eslint` configurations
- `@bingle/typescript-config`: `tsconfig.json`s used throughout the monorepo
- `@bingle/tailwind-config`: reusable `tailwind` configs

Each package/app is 100% [TypeScript](https://www.typescriptlang.org).

## 🛠️ Develop

This section assumes that you already have a PostgreSQL server running with an empty database ready to be used for this project.

1. Set up your database URL

   Store the URL to your PostgreSQL database in `packages/db/.env`.

   ```bash
   echo DATABASE_URL=... >packages/db/.env
   ```

2. Migrate and seed the database

   This will initialize your database according to the schema and seed it with data generated by [Faker](https://fakerjs.dev).

   ```bash
   cd packages/db
   npx prisma migrate dev
   cd -
   ```

3. Set up authentication secrets

   You need to generate the secret key that will later be used by our authentication logic. The key will be shared between the Express server and Next.js app.

   ```bash
   echo AUTH_SECRET=$(npx auth secret --raw) >apps/server/.env.local
   cp apps/server/.env.local apps/web
   ```

4. Launch

   ```bash
   npm run dev
   ```

   And that's it. You should be able to see the web app running on <http://localhost:3000>.

## 🏭 Build

To build and run for production, simply do:

```bash
npm run build
AUTH_TRUST_HOST=true npm run start
```
