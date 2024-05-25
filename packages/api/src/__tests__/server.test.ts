import { createCaller } from "@repo/api";
import { createContextInner } from "@repo/api/trpc";

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
