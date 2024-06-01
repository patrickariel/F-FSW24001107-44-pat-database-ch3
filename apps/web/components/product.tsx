"use client";

import { LoginDialog } from "./login";
import { trpc } from "@/lib/trpc-client";
import { currency, uuidTranslator } from "@/lib/utils";
import type { RouterOutput } from "@repo/api";
import { AspectRatio } from "@repo/ui/aspect-ratio";
import { Button, ButtonProps } from "@repo/ui/button";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import { Image } from "@repo/ui/image";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/tooltip";
import { useToast } from "@repo/ui/use-toast";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

export function CartButton({
  product: { cart, ...product },
  quantity = 1,
  className,
  ...props
}: ButtonProps & {
  product: RouterOutput["product"]["find"]["products"][number];
  quantity?: number;
}) {
  const { data: session } = useSession();
  const utils = trpc.useUtils();
  const { toast } = useToast();
  const [cartState, setCartState] = useState(cart ? true : false);
  const [disabledState, setDisabledState] = useState(false);

  const addToCart = trpc.cart.add.useMutation({
    onMutate: () => setDisabledState(true),
    onSuccess: () => {
      utils.product.get.refetch();
      setDisabledState(false);
      setCartState(true);
      toast({
        title: "Added to cart",
        description: `"${product.name}" has been added to your cart.`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Couldn't add "${product.name}" to your cart.`,
      });
    },
  });

  const removeFromCart = trpc.cart.remove.useMutation({
    onMutate: () => setDisabledState(true),
    onSuccess: () => {
      utils.product.get.refetch();
      setDisabledState(false);
      setCartState(false);
      toast({
        title: "Removed from cart",
        description: `"${product.name}" has been removed from your cart.`,
      });
    },
    onError: () => {
      setDisabledState(false);
      toast({
        variant: "destructive",
        title: "There was a problem",
        description: `Couldn't remove "${product.name}" from your cart.`,
      });
    },
  });

  const onClick = () => {
    if (session) {
      if (!cartState) {
        addToCart.mutate({ items: [{ id: product.id, quantity }] });
      } else {
        removeFromCart.mutate({ id: product.id });
      }
    }
  };

  const Wrap = ({ children }: { children: ReactNode }) =>
    session ? children : <LoginDialog trigger={children} />;

  return (
    <Wrap>
      <Button
        className={cn(
          `flex w-full flex-row gap-2 ${cartState ? "hover:bg-red-500" : ""}`,
          className,
        )}
        variant={disabledState ? "disabled" : "outline"}
        onClick={onClick}
        {...props}
      >
        {cartState ? <Trash2 size={15} /> : <ShoppingCart size={15} />}
        {cartState ? <div>Remove</div> : <div>Add to cart</div>}
      </Button>
    </Wrap>
  );
}

export interface ProductCardProps {
  product: RouterOutput["product"]["find"]["products"][number];
  ratio?: number;
}

export function ProductCard({ product, ratio = 4 / 3 }: ProductCardProps) {
  const router = useRouter();

  return (
    <Card className="size-full overflow-hidden rounded-md">
      <CardHeader
        className="cursor-pointer border-b p-0"
        onClick={() =>
          router.push(`/product/${uuidTranslator.fromUUID(product.id)}`)
        }
      >
        <AspectRatio ratio={ratio}>
          <Image
            src={product.images[0]!}
            alt={product.name}
            className="object-cover"
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, (min-width: 640px) 45vw, (min-width: 475px) 90vw, 100vw"
            fill
            loading="lazy"
          />
        </AspectRatio>
      </CardHeader>
      <CardContent className="select-none space-y-2 px-4 py-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <h2
              className="line-clamp-1 cursor-pointer font-semibold"
              onClick={() =>
                router.push(`/product/${uuidTranslator.fromUUID(product.id)}`)
              }
            >
              {product.name}
            </h2>
          </TooltipTrigger>
          <TooltipContent>
            <p>{product.name}</p>
          </TooltipContent>
        </Tooltip>
        <p className="text-muted-foreground line-clamp-1 text-xs">
          {currency.format(product.price)}
        </p>
        <div className="pt-2">
          <CartButton product={product} />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProductSkeleton({
  ratio = 4 / 3,
}: Omit<ProductCardProps, "product">) {
  return (
    <Card className="size-full overflow-hidden rounded-md">
      <CardHeader className="border-b p-0">
        <AspectRatio className="bg-primary/10 animate-pulse" ratio={ratio} />
      </CardHeader>
      <CardContent className="select-none space-y-2 px-4 py-3">
        <Skeleton className="h-4 w-4/6" />
        <div className="pt-1">
          <Skeleton className="h-4 w-2/6" />
        </div>
        <div className="pt-2">
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
