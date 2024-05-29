"use client";

import { CartItem } from "@/components/cart-item";
import { trpc } from "@/lib/trpc-client";
import { currency } from "@/lib/utils";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { ScrollArea } from "@repo/ui/scroll-area";
import { Separator } from "@repo/ui/separator";
import { ShoppingBasket, ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

function CartDetails({
  children,
  className,
  label,
  content,
}: React.HTMLAttributes<HTMLElement> & { label: string; content: string }) {
  return (
    <article
      className={cn("flex flex-row items-end justify-between", className)}
    >
      <p className="text-sm font-medium lg:text-base">{label}</p>
      <p className="text-sm font-semibold lg:text-base">{content}</p>
      {children}
    </article>
  );
}

export default function Cart() {
  const { data: session } = useSession();
  if (!session) {
    redirect("/");
  }
  const { data: cart, refetch } = trpc.cart.list.useQuery();
  if (!cart) {
    return;
  }

  const itemTotal = cart
    .map(({ product: { price }, quantity }) => price * quantity)
    .reduce((a, b) => a + b, 0);
  const tax = 5;
  const shipping = 25;
  const discount = -8;

  if (cart.length === 0) {
    return (
      <div className="flex h-[calc(100vh-65px)] flex-col items-center justify-center text-center">
        <div className="pb-24">
          <ShoppingCart size={350} className="stroke-zinc-900 pr-11" />
          <h6 className="text-2xl font-bold text-zinc-800">
            Your cart is empty.
          </h6>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex h-[calc(100vh-65px)] flex-col items-center justify-center gap-5  p-8 sm:flex-col md:flex-col lg:flex-row lg:gap-11">
      <ScrollArea className="h-full w-[calc(100vw-50px)] flex-row rounded-md border p-4 md:w-[calc(100vw-150px)] lg:m-0 lg:w-[650px]">
        <div className="flex flex-col">
          {cart.map((item, i) => (
            <>
              <CartItem
                key={item.productId}
                onRemove={() => refetch()}
                item={item}
                className={
                  cart.length === 1
                    ? "py-0"
                    : i === 0
                      ? "pt-0"
                      : i === cart.length - 1
                        ? "pb-0"
                        : ""
                }
              />
              <Separator />
            </>
          ))}
        </div>
      </ScrollArea>
      <div className="flex w-[300px] flex-col justify-center space-y-3 md:w-[360px] md:pt-8 lg:w-[350px] lg:space-y-6 lg:self-start">
        <div className="flex flex-col space-y-3 text-left lg:space-y-5">
          <h1 className="flex flex-row items-center gap-3 text-xl font-semibold tracking-tight lg:text-2xl">
            <ShoppingBasket size={25} />
            Order Details
          </h1>
          <Separator />
          <CartDetails
            label="Item total"
            content={currency.format(itemTotal)}
          />
          <CartDetails label="Tax" content={currency.format(tax)} />
          <CartDetails
            label="Shipping fee"
            content={currency.format(shipping)}
          />
          <CartDetails label="Discount" content={currency.format(discount)} />
        </div>
        <Separator />
        <div className="flex flex-col gap-4 lg:gap-7">
          <p className="flex flex-row items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight lg:text-xl">
              Total
            </h1>
            <p className="text-lg font-semibold lg:text-xl">
              {currency.format(itemTotal + tax + shipping + discount)}
            </p>
          </p>
          <Button>Checkout</Button>
        </div>
      </div>
    </div>
  );
}
