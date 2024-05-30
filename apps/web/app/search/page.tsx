"use client";

import { ProductCard } from "@/components/product";
import { trpc } from "@/lib/trpc-client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@repo/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/select";
import Spinner from "@repo/ui/spinner";
import _ from "lodash";
import { Frown } from "lucide-react";
import {
  redirect,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useInView } from "react-intersection-observer";
import { z } from "zod";

const SearchSchema = z.object({
  query: z.string().nullish(),
  department: z.string().nullish(),
  sort: z.enum(["price", "added", "relevance"]).nullish(),
  order: z.enum(["asc", "desc"]).nullish(),
  minPrice: z.coerce.number().nullish(),
  maxPrice: z.coerce.number().nullish(),
  minRating: z.coerce.number().nullish(),
  maxRating: z.coerce.number().nullish(),
});

const FilterSchema = z.object({
  sort: z
    .enum(["Relevance", "Newest", "Oldest", "HighestPrice", "LowestPrice"])
    .default("Newest"),
  price: z
    .enum([
      "Any",
      "ZeroToOne",
      "OneToThree",
      "ThreeToTen",
      "TenToTwenty",
      "OverTwenty",
    ])
    .default("Any"),
  rating: z.enum(["Any", "OverFour"]).default("Any"),
});

function searchToFilter(search: z.input<typeof SearchSchema>) {
  const filter: Partial<z.infer<typeof FilterSchema>> = {
    sort: "Newest",
    price: "Any",
    rating: "Any",
  };

  if (search.sort) {
    const order = search.order ?? "desc";
    switch (search.sort) {
      case "price":
        switch (order) {
          case "asc":
            filter.sort = "LowestPrice";
            break;
          case "desc":
            filter.sort = "HighestPrice";
            break;
        }
        break;
      case "added":
        switch (order) {
          case "asc":
            filter.sort = "Oldest";
            break;
          case "desc":
            filter.sort = "Newest";
            break;
        }
        break;
      case "relevance":
        switch (order) {
          case "asc":
            filter.sort = undefined;
            break;
          case "desc":
            filter.sort = "Relevance";
            break;
        }
        break;
    }
  }

  if (search.minPrice && search.maxPrice) {
    if (search.minPrice === 0 && search.maxPrice === 1) {
      filter.price = "ZeroToOne";
    } else if (search.minPrice === 1 && search.maxPrice === 3) {
      filter.price = "OneToThree";
    } else if (search.minPrice === 3 && search.maxPrice === 10) {
      filter.price = "ThreeToTen";
    } else if (search.minPrice === 10 && search.maxPrice === 20) {
      filter.price = "TenToTwenty";
    } else {
      filter.price = undefined;
    }
  } else if (search.minPrice === 20) {
    filter.price = "OverTwenty";
  } else if (search.minPrice || search.maxPrice) {
    filter.price = undefined;
  }

  if (!search.maxRating && search.minRating === 4) {
    filter.rating = "OverFour";
  } else if (search.maxRating || search.minRating) {
    filter.rating = undefined;
  }

  return filter;
}

function filterToSearch(filter: z.infer<typeof FilterSchema>) {
  const search: z.input<typeof SearchSchema> = {};

  switch (filter.sort) {
    case "Oldest":
      search.sort = "added";
      search.order = "asc";
      break;
    case "Newest":
      search.sort = "added";
      search.order = "desc";
      break;
    case "LowestPrice":
      search.sort = "price";
      search.order = "asc";
      break;
    case "HighestPrice":
      search.sort = "price";
      search.order = "desc";
      break;
    case "Relevance":
      search.sort = "relevance";
      search.order = "desc";
  }

  switch (filter.price) {
    case "ZeroToOne":
      search.minPrice = 0;
      search.maxPrice = 1;
      break;
    case "OneToThree":
      search.minPrice = 1;
      search.maxPrice = 3;
      break;
    case "ThreeToTen":
      search.minPrice = 3;
      search.maxPrice = 10;
      break;
    case "TenToTwenty":
      search.minPrice = 10;
      search.maxPrice = 20;
      break;
    case "OverTwenty":
      search.minPrice = 20;
      search.maxPrice = null;
      break;
    case "Any":
      search.minPrice = null;
      search.maxPrice = null;
  }

  switch (filter.rating) {
    case "OverFour":
      search.minRating = 4;
      search.maxRating = null;
      break;
    case "Any":
      search.minRating = null;
      search.maxRating = null;
      break;
  }

  return search;
}

function FilterForm({
  defaultValues,
}: {
  defaultValues?: Partial<z.infer<typeof FilterSchema>>;
}) {
  const form = useForm<z.infer<typeof FilterSchema>>({
    resolver: zodResolver(FilterSchema),
    defaultValues,
  });
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { push } = useRouter();

  async function onSubmit(data: z.infer<typeof FilterSchema>) {
    const search = filterToSearch(data);
    const params = new URLSearchParams(searchParams.toString());
    for (const [name, value] of Object.entries(search)) {
      if (!(value === null || value == undefined)) {
        params.set(_.kebabCase(name), value.toString());
      } else if (value === null) {
        params.delete(_.kebabCase(name));
      }
    }
    push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    const subscription = form.watch(() => {
      form.handleSubmit(onSubmit)();
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const sort = FilterSchema.shape.sort._def.innerType;
  const price = FilterSchema.shape.price._def.innerType;
  const rating = FilterSchema.shape.rating._def.innerType;

  return (
    <Form {...form}>
      <form
        className="flex w-full flex-row justify-center gap-3 sm:justify-end sm:gap-7"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          control={form.control}
          name="sort"
          render={({ field }) => (
            <FormItem className="w-full max-w-[150px]">
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={sort.Values.Relevance}>
                    Relevance
                  </SelectItem>
                  <SelectItem value={sort.Values.Newest}>Newest</SelectItem>
                  <SelectItem value={sort.Values.Oldest}>Oldest</SelectItem>
                  <SelectItem value={sort.Values.LowestPrice}>
                    Lowest price
                  </SelectItem>
                  <SelectItem value={sort.Values.HighestPrice}>
                    Highest price
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem className="w-full max-w-[150px]">
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Price" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={price.Values.Any}>Any price</SelectItem>
                  <SelectItem value={price.Values.ZeroToOne}>
                    $0 to $1
                  </SelectItem>
                  <SelectItem value={price.Values.OneToThree}>
                    $1 to $3
                  </SelectItem>
                  <SelectItem value={price.Values.ThreeToTen}>
                    $3 to $10
                  </SelectItem>
                  <SelectItem value={price.Values.TenToTwenty}>
                    $10 to $20
                  </SelectItem>
                  <SelectItem value={price.Values.OverTwenty}>
                    Over $20
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem className="w-full max-w-[150px]">
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={rating.Values.Any}>Any rating</SelectItem>
                  <SelectItem value={rating.Values.OverFour}>
                    4 ⭐ and up
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

function SearchResults({
  data,
}: ReturnType<typeof trpc.product.find.useInfiniteQuery>) {
  if (!data) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (data.pages.length === 0 || data.pages[0]!.products.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="pb-24">
          <Frown size={350} className="stroke-zinc-900 pb-[25px]" />
          <h6 className="text-2xl font-bold text-zinc-800">No matches.</h6>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
      {data.pages.map((page) =>
        page.products.map((product, i) => (
          <ProductCard key={i} product={product} />
        )),
      )}
    </div>
  );
}

function Search() {
  const searchParams = useSearchParams();
  const search = SearchSchema.parse({
    query: searchParams.get("query"),
    department: searchParams.get("department"),
    sort: searchParams.get("sort"),
    order: searchParams.get("order"),
    minPrice: searchParams.get("min-price"),
    maxPrice: searchParams.get("max-price"),
    minRating: searchParams.get("min-rating"),
    maxRating: searchParams.get("max-rating"),
  });

  const { ref, inView } = useInView({
    threshold: 1,
    rootMargin: "0px 0px -70px 0px",
  });

  if (search.query === null) {
    redirect("/");
  }

  const query = trpc.product.find.useInfiniteQuery(
    {
      limit: 30,
      ...search,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  useEffect(() => {
    if (data && inView && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [data, inView, isFetchingNextPage, fetchNextPage]);

  console.log(data);
  console.log(data?.pages.length);

  return (
    <div className="container flex flex-1 flex-grow flex-col items-center justify-start gap-5 py-5 xl:px-28">
      <div className="flex w-full flex-row items-center justify-between">
        <h3 className="hidden text-2xl font-semibold sm:block">Results</h3>
        <FilterForm defaultValues={searchToFilter(search)} />
      </div>
      <SearchResults {...query} />
      {data && data.pages.length > 0 && data.pages[0]!.products.length > 0 && (
        <>
          {isFetchingNextPage && (
            <div className="flex h-14 items-center">
              <Spinner />
            </div>
          )}
          {!isFetchingNextPage && hasNextPage && (
            <div className="h-14" ref={ref} />
          )}
          {!hasNextPage && (
            <div className="flex h-14 items-center">
              <h5 className="text-muted-foreground">No more results.</h5>
            </div>
          )}
        </>
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
