"use client";

import { ProductCard } from "@/components/product";
import { trpc } from "@/lib/trpc-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import Spinner from "@repo/ui/spinner";
import { Frown } from "lucide-react";
import { redirect, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useInView } from "react-intersection-observer";

function Search() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const department = searchParams.get("department") ?? "All";
  const { ref, inView } = useInView({
    threshold: 1,
    rootMargin: "0px 0px -70px 0px",
  });

  if (query === null) {
    redirect("/");
  }

  const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
    trpc.product.find.useInfiniteQuery(
      {
        limit: 30,
        query,
        ...(department !== "All" && { department }),
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
      <div className="flex h-[calc(100vh-65px)] w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (data.pages.length === 0 || data.pages[0]!.products.length === 0) {
    return (
      <div className="flex h-[calc(100vh-65px)] flex-col items-center justify-center text-center">
        <div className="pb-24">
          <Frown size={350} className="stroke-zinc-900 pb-[25px]" />
          <h6 className="text-2xl font-bold text-zinc-800">No matches.</h6>
        </div>
      </div>
    );
  }

  return (
    <div className="container flex flex-col items-center justify-center gap-5 py-5 xl:px-28">
      <div className="flex w-full flex-row items-center justify-between">
        <h3 className="hidden text-2xl font-semibold sm:block">Results</h3>
        <div className="flex w-full flex-row justify-center gap-3 sm:justify-end sm:gap-7">
          <Select defaultValue="new">
            <SelectTrigger className="w-full max-w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Newest</SelectItem>
              <SelectItem value="old">Oldest</SelectItem>
              <SelectItem value="old">Lowest price</SelectItem>
              <SelectItem value="old">Highest price</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="any">
            <SelectTrigger className="w-full max-w-[160px]">
              <SelectValue placeholder="Price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any price</SelectItem>
              <SelectItem value="0-1">$0 to $1</SelectItem>
              <SelectItem value="1-3">$1 to $3</SelectItem>
              <SelectItem value="3-5">$3 to $5</SelectItem>
              <SelectItem value="5-10">$5 to $10</SelectItem>
              <SelectItem value="10-15">$10 to $15</SelectItem>
              <SelectItem value="15-20">$15 to $20</SelectItem>
              <SelectItem value=">20">Over $20</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="any">
            <SelectTrigger className="w-full max-w-[160px]">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any rating</SelectItem>
              <SelectItem value=">4">4 ⭐ and up</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {data.pages.map((page) =>
          page.products.map((product, i) => (
            <ProductCard key={i} product={product} />
          )),
        )}
      </div>
      {isFetchingNextPage && (
        <div className="flex h-14 items-center">
          <Spinner />
        </div>
      )}
      {!isFetchingNextPage && hasNextPage && <div className="h-14" ref={ref} />}
      {!hasNextPage && (
        <div className="flex h-14 items-center">
          <h5 className="text-muted-foreground">No more results.</h5>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Search />
    </Suspense>
  );
}
