"use client";

import { CartItem } from "@/components/cart-item";
import { trpc } from "@/lib/trpc-client";
import { currency } from "@/lib/utils";
import { Button } from "@bingle/ui/button";
import { cn } from "@bingle/ui/lib/utils";
import { ScrollArea } from "@bingle/ui/scroll-area";
import { Separator } from "@bingle/ui/separator";
import Spinner from "@bingle/ui/spinner";
import { toast } from "@bingle/ui/use-toast";
import { ShoppingBasket, ShoppingCart, PartyPopper } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

enum CheckoutPhase {
  None,
  Processing,
  Done,
}

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

function Success() {
  const { push } = useRouter();
  return (
    <div className="container flex grow flex-col items-center justify-center gap-4 py-4 pb-16 lg:gap-12 lg:pb-32">
      <PartyPopper className="size-44 stroke-zinc-800 lg:size-64" />
      <div className="flex flex-col items-center gap-5 lg:gap-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-muted-foreground min-w-32 text-2xl">
            Order completed!
          </h1>
          <h1 className="text-muted-foreground min-w-80 text-lg">
            Thank you for shopping at Bingle.
          </h1>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row lg:gap-8">
          <Button className="landscape:max-lg:h-8" onClick={() => push("/")}>
            Continue shopping
          </Button>
          <Button className="landscape:max-lg:h-8" variant={"outline"}>
            Order details
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const { status } = useSession();
  const { data: cart } = trpc.cart.list.useQuery();
  const [disableAll, setDisableAll] = useState(false);
  const [disableCheckout, setDisableCheckout] = useState(false);
  const [checkoutPhase, setCheckoutPhase] = useState(CheckoutPhase.None);
  const utils = trpc.useUtils();

  const checkout = trpc.cart.checkout.useMutation({
    onMutate: () => {
      setDisableAll(true);
      setCheckoutPhase(CheckoutPhase.Processing);
    },
    onSuccess: () => {
      setCheckoutPhase(CheckoutPhase.Done);
      utils.user.get.refetch();
      utils.cart.list.refetch();
      setDisableAll(false);
    },
    onError: (error) => {
      setDisableAll(false);
      setCheckoutPhase(CheckoutPhase.None);
      toast({
        variant: "destructive",
        title: error.data?.code ?? "Error",
        description: error.message,
      });
    },
  });

  if (checkoutPhase === CheckoutPhase.Done) {
    return <Success />;
  }

  if (
    !cart ||
    status === "loading" ||
    checkoutPhase === CheckoutPhase.Processing
  ) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  } else if (status === "unauthenticated") {
    redirect("/");
  }

  const itemTotal = cart
    .map(({ product: { price }, quantity }) => price * quantity)
    .reduce((a, b) => a + b, 0);
  const tax = 5;
  const shipping = 25;
  const discount = -8;

  if (cart.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center pb-12 text-center lg:pb-24">
        <ShoppingCart size={350} className="stroke-zinc-900 pr-11" />
        <h6 className="text-2xl font-bold text-zinc-800">
          Your cart is empty.
        </h6>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col items-start justify-center gap-5 px-4 py-4 sm:container md:flex-row md:items-center lg:gap-11 lg:px-16 lg:py-8">
      <ScrollArea className="flex grow basis-10/12 flex-row self-stretch rounded-md border p-4 lg:m-0 lg:basis-8/12">
        <div className="flex flex-col">
          {cart.map((item) => (
            <>
              <CartItem
                key={item.productId}
                disabled={disableAll}
                onPending={() => setDisableCheckout(true)}
                onDone={() => setDisableCheckout(false)}
                item={item}
                className="py-3"
              />
              <Separator />
            </>
          ))}
        </div>
      </ScrollArea>
      <div className="flex min-w-[300px] grow basis-2/12 flex-col justify-center space-y-3 self-center pt-2 md:self-start lg:basis-4/12 lg:space-y-6 lg:pt-4">
        <div className="flex flex-col space-y-3 text-left lg:space-y-5">
          <h1 className="flex flex-row items-center gap-3 text-lg font-semibold tracking-tight lg:text-2xl">
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
          <Button
            className="disabled:opacity-100"
            disabled={disableAll || disableCheckout}
            onClick={() => checkout.mutate()}
          >
            Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}
