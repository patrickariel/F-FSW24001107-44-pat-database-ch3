"use client";

import { ProductCard } from "@/components/product";
import { trpc } from "@/lib/trpc-client";
import { Separator } from "@bingle/ui/separator";
import Spinner from "@bingle/ui/spinner";
import _ from "lodash";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export default function Page({ params }: { params: { category: string } }) {
  const category = _.capitalize(params.category);
  const { ref, inView } = useInView({
    threshold: 1,
    rootMargin: "0px 0px -70px 0px",
  });

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    trpc.product.find.useInfiniteQuery(
      {
        limit: 30,
        department: category,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    );

  useEffect(() => {
    if (data && inView && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [data, inView, isFetchingNextPage, fetchNextPage]);

  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (data.pages.length === 0 || data.pages[0]!.products.length === 0) {
    redirect("/");
  }

  return (
    <div className="container flex grow flex-col items-center justify-start gap-6 py-5 xl:px-28">
      <div className="pt-4 text-xl sm:self-start sm:text-2xl">{category}</div>
      <Separator />
      <div className="grid w-full gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {data.pages.map((page) =>
          page.products.map((product, i) => (
            <ProductCard key={i} product={product} />
          )),
        )}
      </div>
      <div
        className="flex h-14 flex-col items-center justify-center"
        {...(!isFetchingNextPage && hasNextPage && { ref })}
      >
        {isFetchingNextPage && <Spinner />}
        {!hasNextPage && (
          <h5 className="text-muted-foreground">No more results.</h5>
        )}
      </div>
    </div>
  );
}
