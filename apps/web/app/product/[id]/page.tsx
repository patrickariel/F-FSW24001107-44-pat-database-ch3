"use client";

import { CartButton } from "@/components/product";
import { trpc } from "@/lib/trpc-client";
import { currency, fixed, uuidTranslator } from "@/lib/utils";
import { Button } from "@repo/ui/button";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@repo/ui/carousel";
import { Image } from "@repo/ui/image";
import { Input } from "@repo/ui/input";
import _ from "lodash";
import { Minus, Plus, Star } from "lucide-react";
import ErrorPage from "next/error";
import { useEffect, useState } from "react";

export default function Page({ params }: { params: { id: string } }) {
  const [qtyState, setQtyState] = useState(1);
  const [selected, setSelected] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [loaded, setLoaded] = useState(fixed(() => false, 4));

  const { data: product } = trpc.product.get.useQuery({
    id: uuidTranslator.toUUID(params.id),
  });

  useEffect(() => api?.scrollTo(selected), [selected]);

  useEffect(() => {
    api?.on("select", () => setSelected(api.selectedScrollSnap()));
  }, [api]);

  useEffect(() => {
    setQtyState(product?.cart?.quantity ?? 1);
  }, [product]);

  if (product === null) {
    return (
      <div className="flex h-[calc(100vh-65px)] items-center justify-center">
        <ErrorPage statusCode={404} />
      </div>
    );
  }

  if (!product) {
    return <div>loading...</div>;
  }

  return (
    <div className="container flex items-center justify-center p-2 lg:p-8">
      <div className="bg-card text-card-foreground container flex h-full flex-col items-center justify-evenly gap-8 rounded-xl p-8 shadow sm:gap-14 lg:flex-row lg:items-start lg:gap-5">
        <div className="flex max-w-[600px] flex-col items-center gap-5 sm:gap-10">
          <Carousel setApi={setApi}>
            <CarouselContent>
              {_.range(0, 4).map((i) => (
                <CarouselItem key={i}>
                  <Image
                    src={product.images[i]!}
                    alt={product.name}
                    className="rounded-xl transition-all"
                    sizes="(min-width: 1024px) 40vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
                    width={600}
                    height={450}
                    loading="lazy"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="grid grid-cols-4 gap-4">
            {_.range(0, 4).map((i) => (
              <Image
                key={i}
                src={product.images[i]!}
                alt={`${product.name} ${i}`}
                onClick={() => setSelected(i)}
                onLoadingComplete={() => {
                  setLoaded((value) => {
                    value[i] = true;
                    return [...value];
                  });
                }}
                className={`cursor-pointer rounded-xl transition-all ${loaded[i] && selected === i ? "outline outline-4 outline-offset-2 outline-sky-500" : ""}`}
                sizes="(min-width: 1024px) 30vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
                width={140}
                height={100}
                loading="eager"
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 sm:w-[500px] md:w-[556px] md:gap-9">
          <h1 className="self-start text-2xl font-medium md:text-4xl">
            {product.name}
          </h1>
          <div className="flex flex-row items-center gap-3">
            <div className="flex flex-row gap-1">
              {_.range(0, 5).map((i) => (
                <Star key={i} className="h-4 w-4 fill-current md:h-5 md:w-5" />
              ))}
            </div>
            <p className="text-muted-foreground">(246 reviews)</p>
          </div>
          <div className="flex flex-col gap-2">
            <article className="flex flex-row gap-2">
              <p className="text-muted-foreground md:text-base">Department:</p>
              <p>{product.department}</p>
            </article>
            <article className="flex flex-row gap-2">
              <p className="text-muted-foreground">Type:</p>
              <p>{product.adjective}</p>
            </article>
            <article className="flex flex-row gap-2">
              <p className="text-muted-foreground">Material:</p>
              <p>{product.material}</p>
            </article>
          </div>
          <div className="flex flex-row items-center justify-start gap-8">
            <h1 className="text-xl font-semibold md:self-start md:pb-1 md:text-3xl">
              {currency.format(product.price)}
            </h1>
            <div className="flex flex-row items-center gap-4">
              <div className="flex flex-row">
                <Button
                  variant="outline"
                  disabled={product.cart ? true : false}
                  size="icon"
                  onClick={() => {
                    const quantity = Math.max(qtyState - 1, 1);
                    setQtyState(quantity);
                  }}
                  className="size-8 rounded-r-none"
                >
                  <Minus size={15} />
                </Button>
                <Input
                  value={qtyState === 0 ? "" : qtyState}
                  disabled={product.cart ? true : false}
                  className="h-8 w-11 rounded-none border-x-0 text-center"
                  onChange={(e) => {
                    let quantity;
                    if (e.target.value === "") {
                      quantity = 0;
                    } else {
                      const parsed = parseInt(e.target.value);
                      if (!Number.isNaN(parsed)) {
                        quantity = Math.min(Math.max(parsed, 1), product.stock);
                      }
                    }
                    if (quantity) {
                      setQtyState(quantity);
                    }
                  }}
                />
                <Button
                  variant="outline"
                  disabled={product.cart ? true : false}
                  size="icon"
                  className="size-8 rounded-l-none"
                  onClick={() => {
                    const quantity = Math.min(qtyState + 1, product.stock);
                    setQtyState(quantity);
                  }}
                >
                  <Plus size={15} />
                </Button>
              </div>
              <CartButton
                product={product}
                className="w-36"
                quantity={qtyState}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-xl font-bold md:text-2xl">Description</h1>
            <p className="text-muted-foreground">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
