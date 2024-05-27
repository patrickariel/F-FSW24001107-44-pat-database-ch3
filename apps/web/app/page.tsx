"use client";

import { ProductCard, ProductSkeleton } from "@/components/product";
import { trpc } from "@/lib/trpc-client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@repo/ui/carousel";
import { ContentSection } from "@repo/ui/content-section";
import _ from "lodash";

export default function Page() {
  const { data: outdoors } = trpc.product.find.useQuery({
    department: "Outdoors",
  });
  const { data: electronics } = trpc.product.find.useQuery({
    department: "Electronics",
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <div className="container max-w-5xl">
        <ContentSection
          title="Best seller in Outdoors"
          description="For your next exciting outdoor adventure."
          href="/"
          asChild={true}
          className="pt-5"
        >
          <Carousel
            autoPlay={true}
            autoPlayOpts={{ delay: 3000 }}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="px-[0.2px]">
              {(outdoors
                ? outdoors.products
                    .slice(0, 10)
                    .map((product, i) => (
                      <ProductCard key={i} product={product} ratio={16 / 15} />
                    ))
                : _.range(0, 10).map((i) => (
                    <ProductSkeleton key={i} ratio={16 / 15} />
                  ))
              ).map((elem, i) => (
                <CarouselItem
                  key={i}
                  className="sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
                >
                  {elem}
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </ContentSection>
        <ContentSection
          title="Electronics"
          description="Find the latest gadgets from the best makers."
          href="/"
          linkText="See more"
          className="pt-14 md:pt-20 lg:pt-24"
        >
          {electronics
            ? electronics.products
                .slice(0, 8)
                .map((product, i) => <ProductCard key={i} product={product} />)
            : _.range(0, 8).map((i) => <ProductSkeleton key={i} />)}
        </ContentSection>
      </div>
    </main>
  );
}
