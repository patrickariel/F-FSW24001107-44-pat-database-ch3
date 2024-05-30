"use client";

import { ProductCard } from "@/components/product";
import { trpc } from "@/lib/trpc-client";
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
    <div className="flex flex-col items-center justify-center p-8">
      <div className="container grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:px-28">
        {data.pages.map((page) =>
          page.products.map((product, i) => (
            <ProductCard key={i} product={product} />
          )),
        )}
      </div>
      {isFetchingNextPage && <Spinner className="mt-7" />}
      {!isFetchingNextPage && hasNextPage && <div className="h-14" ref={ref} />}
      {!hasNextPage && (
        <h5 className="text-muted-foreground mt-10">No more results.</h5>
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
