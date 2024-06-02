import { Button } from "@bingle/ui/button";
import { Form, FormControl, FormField, FormItem } from "@bingle/ui/form";
import { Input } from "@bingle/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@bingle/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { PackageSearch, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const Department = z.enum(
  [
    "All",
    "Baby",
    "Beauty",
    "Books",
    "Clothing",
    "Computers",
    "Electronics",
    "Games",
  ],
  { message: "Invalid department" },
);

const FormSchema = z.object({
  query: z.string().min(1, {
    message: "A keyword query is required",
  }),
  department: Department,
});

export function SearchBox() {
  const { push } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = pathname === "/search" ? searchParams.get("query") : null;
  const department =
    pathname === "/search"
      ? Department.safeParse(searchParams.get("department")).data
      : undefined;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      department: department ? department : "All",
    },
  });

  const onSubmit = useCallback(
    (data: z.infer<typeof FormSchema>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [name, value] of Object.entries(data)) {
        params.delete(name);
        params.set(name, value);
      }
      push(`/search?${params.toString()}`);
    },
    [searchParams],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-1/3 w-full flex-row items-center space-x-6"
      >
        <div className="flex w-full flex-row">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className="h-9 w-10 truncate rounded-r-none p-2 sm:w-24 sm:px-3 sm:py-2 lg:w-32"
                      collapseIcon={true}
                    >
                      <span className="*:text-muted-foreground *:hidden *:truncate *:sm:block">
                        <SelectValue placeholder="Category" />
                      </span>
                      <PackageSearch size={18} className="sm:hidden" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(Department.Values).map((department, i) => (
                      <SelectItem key={i} value={department}>
                        {department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input
                    className="h-9 text-ellipsis rounded-none border-x-0"
                    placeholder="Search Bling"
                    {...(query && { defaultValue: query })}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            className="size-9 rounded-l-none p-2"
            variant="outline"
            type="submit"
          >
            <Search />
          </Button>
        </div>
      </form>
    </Form>
  );
}
