import { createCaller } from "@repo/api";

test("get products", async () => {
  const caller = createCaller({ user: undefined });

  const products = await caller.product.find({
    department: "Computers",
    limit: 5,
  });

  expect(products.products).not.toHaveLength(0);
  expect(products.products).not.toHaveLength(6);
});
