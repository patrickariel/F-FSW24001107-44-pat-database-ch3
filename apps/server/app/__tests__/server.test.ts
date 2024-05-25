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
