"use client";

import { CartButton } from "@/components/product";
import { trpc } from "@/lib/trpc-client";
import { currency, fixed, uuidTranslator } from "@/lib/utils";
import { Button } from "@bingle/ui/button";
import { Card, CardContent } from "@bingle/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@bingle/ui/carousel";
import { Image } from "@bingle/ui/image";
import { Input } from "@bingle/ui/input";
import { Skeleton } from "@bingle/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@bingle/ui/tooltip";
import _ from "lodash";
import { Minus, Plus } from "lucide-react";
import ErrorPage from "next/error";
import { useEffect, useState } from "react";
import { FaRegStarHalfStroke, FaRegStar, FaStar } from "react-icons/fa6";

export default function Page({ params }: { params: { id: string } }) {
  const [qtyState, setQtyState] = useState(1);
  const [selected, setSelected] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [loaded, setLoaded] = useState(fixed(() => false, 4));

  const { data: product } = trpc.product.get.useQuery({
    id: uuidTranslator.toUUID(params.id),
    reviewMeta: true,
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

  return (
    <div className="container flex items-center justify-center p-2 lg:p-8">
      <div className="bg-card text-card-foreground container flex h-full flex-col items-center justify-evenly gap-8 rounded-xl p-8 shadow sm:gap-14 lg:flex-row lg:items-start lg:gap-5">
        <div className="flex w-full max-w-[600px] flex-col items-center gap-5 sm:gap-10">
          <Carousel setApi={setApi} className="w-full">
            <CarouselContent>
              {product
                ? [product.images[0]!, ...product.images.slice(1, 4)].map(
                    (image, i) => (
                      <CarouselItem key={i}>
                        <Image
                          src={image}
                          alt={product.name}
                          className="rounded-xl transition-all"
                          sizes="(min-width: 768px) 50vw, 100vw"
                          width={600}
                          height={450}
                          loading="lazy"
                        />
                      </CarouselItem>
                    ),
                  )
                : _.range(0, 4).map((i) => (
                    <CarouselItem key={i}>
                      <Card className="border-none">
                        <CardContent className="bg-muted flex aspect-[4/3] animate-pulse items-center justify-center rounded-xl p-6" />
                      </Card>
                    </CarouselItem>
                  ))}
            </CarouselContent>
          </Carousel>
          <div className="grid w-full max-w-[600px] grid-cols-4 gap-4">
            {product
              ? [product.images[0]!, ...product.images.slice(1, 4)].map(
                  (image, i) => (
                    <Image
                      key={i}
                      src={image}
                      alt={`${image} ${i}`}
                      onClick={() => setSelected(i)}
                      onLoadingComplete={() => {
                        setLoaded((value) => {
                          value[i] = true;
                          return [...value];
                        });
                      }}
                      className={`cursor-pointer rounded-xl transition-all ${loaded[i] && selected === i ? "outline outline-4 outline-offset-2 outline-sky-500" : ""}`}
                      sizes="(min-width: 1024px) 8vw, (min-width: 768px) 15vw, 25vw"
                      width={140}
                      height={100}
                      loading="eager"
                    />
                  ),
                )
              : _.range(0, 4).map((i) => (
                  <Card key={i} className="w-full max-w-[140px] border-none">
                    <CardContent className="bg-muted flex aspect-[4/3] animate-pulse items-center justify-center rounded-xl p-6" />
                  </Card>
                ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-5 sm:max-w-[500px] md:max-w-[556px] md:gap-9">
          {product ? (
            <h1 className="self-start text-2xl font-medium md:text-4xl">
              {product.name}
            </h1>
          ) : (
            <Skeleton className="h-8 w-full rounded-xl" />
          )}
          <div className="flex flex-row items-center gap-3">
            {product ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex flex-row gap-1">
                    {_.range(0, 5).map((i) => {
                      const rounded =
                        Math.round((product.reviews?.average ?? 0) / 0.5) * 0.5;
                      return rounded >= i + 1 ? (
                        <FaStar
                          key={i}
                          className="h-4 w-4 fill-current md:h-5 md:w-5"
                        />
                      ) : rounded === i + 0.5 ? (
                        <FaRegStarHalfStroke
                          key={i}
                          className="h-4 w-4 fill-current stroke-current md:h-5 md:w-5"
                        />
                      ) : (
                        <FaRegStar
                          key={i}
                          className="h-4 w-4 fill-current md:h-5 md:w-5"
                        />
                      );
                    })}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{(product.reviews?.average ?? 0).toFixed(1)} stars</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Skeleton className="h-7 w-full basis-1/4 rounded-xl" />
            )}
            {product ? (
              <p className="text-muted-foreground">
                ({`${product.reviews?.total ?? 0}`} reviews)
              </p>
            ) : (
              <Skeleton className="h-4 w-full basis-1/3 rounded-xl" />
            )}
          </div>
          <div className="flex flex-col gap-2">
            <article className="flex flex-row gap-2">
              {product ? (
                <p className="text-muted-foreground md:text-base">
                  Department:
                </p>
              ) : (
                <Skeleton className="h-5 w-full basis-1/6 rounded-xl" />
              )}
              {product ? (
                <p>{product.department}</p>
              ) : (
                <Skeleton className="h-5 w-full basis-1/4 rounded-xl" />
              )}
            </article>
            <article className="flex flex-row gap-2">
              {product ? (
                <p className="text-muted-foreground">Manufacturer:</p>
              ) : (
                <Skeleton className="h-5 w-full basis-1/12 rounded-xl" />
              )}
              {product ? (
                <p>{product.manufacturer}</p>
              ) : (
                <Skeleton className="h-5 w-full basis-1/3 rounded-xl" />
              )}
            </article>
            <article className="flex flex-row gap-2">
              {product ? (
                <p className="text-muted-foreground">Weight:</p>
              ) : (
                <Skeleton className="h-5 w-full basis-1/5 rounded-xl" />
              )}
              {product ? (
                <p>
                  {new Intl.NumberFormat("en-US", {
                    style: "unit",
                    unit: "gram",
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  }).format(product.weight)}
                </p>
              ) : (
                <Skeleton className="h-5 w-full basis-1/4 rounded-xl" />
              )}
            </article>
          </div>
          <div className="flex flex-col items-start justify-start gap-2 sm:flex-row sm:items-center sm:gap-8">
            {product ? (
              <h1 className="text-xl font-semibold md:text-3xl">
                {currency.format(product.price)}
              </h1>
            ) : (
              <Skeleton className="h-7 w-full max-w-28 rounded-xl" />
            )}
            <div className="flex w-full flex-row items-center gap-4">
              {product ? (
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
                          quantity = Math.min(
                            Math.max(parsed, 1),
                            product.stock,
                          );
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
              ) : (
                <Skeleton className="h-7 w-full max-w-28" />
              )}
              {product ? (
                <CartButton
                  product={product}
                  className="w-36"
                  quantity={qtyState}
                />
              ) : (
                <Skeleton className="h-9 w-full max-w-32" />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {product ? (
              <h1 className="text-xl font-bold md:text-2xl">Description</h1>
            ) : (
              <Skeleton className="mb-5 h-7 w-full max-w-64 rounded-xl" />
            )}
            {product ? (
              <p className="text-muted-foreground">{product.description}</p>
            ) : (
              _.range(0, 10).map(() => (
                <Skeleton
                  className={`h-4 max-w-[600px] rounded-xl`}
                  style={{
                    width: `${_.random(33, 100)}%`,
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
