import { type AppRouter, createCaller } from "@repo/api";
import { createContextInner } from "@repo/api/trpc";
import type { inferProcedureInput } from "@trpc/server";

test("greet user's name", async () => {
  const ctx = await createContextInner({});
  const caller = createCaller(ctx);

  const input: inferProcedureInput<AppRouter["greet"]> = "John Smith";

  const greeting = await caller.greet(input);

  expect(greeting).toBe(`Hello, ${input}`);
});

test("get products", async () => {
  const ctx = await createContextInner({});
  const caller = createCaller(ctx);

  const products = await caller.product.find({
    department: "Computers",
    limit: 5,
  });

  expect(products.products).not.toHaveLength(0);
  expect(products.products).not.toHaveLength(6);
});
