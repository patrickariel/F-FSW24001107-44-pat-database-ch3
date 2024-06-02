"use client";

import { trpc } from "@/lib/trpc-client";
import { uuidTranslator } from "@/lib/utils";
import { NumberInput } from "@bingle/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@bingle/ui/select";
import Spinner from "@bingle/ui/spinner";
import { Textarea } from "@bingle/ui/textarea";
import { toast } from "@bingle/ui/use-toast";
import { Button } from "@bling/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@bling/ui/form";
import { Input } from "@bling/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import _ from "lodash";
import { Upload, CirclePlus, CircleMinus } from "lucide-react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function Page() {
  const { status } = useSession();
  const { push } = useRouter();
  const [disabled, setDisabled] = useState(false);
  const [extra, setExtra] = useState(0);

  const addProduct = trpc.product.add.useMutation({
    onMutate: () => setDisabled(true),
    onSuccess: ({ id }) => push(`/product/${uuidTranslator.fromUUID(id)}`),
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create a new product entry`,
      });
      setDisabled(false);
    },
  });

  const formSchema = z.object({
    name: z.string().min(8, {
      message: "Product name must be at least 8 characters.",
    }),
    manufacturer: z.string().min(8, {
      message: "Manufacturer name must be at least 8 characters.",
    }),
    department: z.enum([
      "Baby",
      "Beauty",
      "Books",
      "Clothing",
      "Computers",
      "Electronics",
      "Games",
    ]),
    price: z.number(),
    stock: z.number(),
    weight: z.number(),
    description: z.string().min(25, {
      message: "Description must be at least 25 characters",
    }),
    imageOne: z.string().url(),
    imageTwo: z.string().url().optional(),
    imageThree: z.string().url().optional(),
    imageFour: z.string().url().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  if (status === "loading") {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  } else if (status === "unauthenticated") {
    redirect("/");
  }

  function onSubmit(data: z.infer<typeof formSchema>) {
    addProduct.mutate({
      ..._.omit(data, "imageOne", "imageTwo", "imageThree", "imageFour"),
      images: [
        data.imageOne,
        ...[data.imageTwo, data.imageThree, data.imageFour].filter(
          (image): image is string => typeof image === "string",
        ),
      ],
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-7 p-5 pb-14 pt-8">
      <div className="flex flex-row items-center gap-3 self-start">
        <Upload />
        <h1 className="text-2xl">Sell a product</h1>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Lugubrious Laff-O-Matic" {...field} />
                </FormControl>
                <FormDescription>
                  This will be the display name for your product
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <NumberInput
                    {...field}
                    placeholder="$15.99"
                    minValue={1}
                    formatOptions={{
                      style: "currency",
                      currency: "USD",
                    }}
                  />
                </FormControl>
                <FormDescription>How much your product costs</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick a department..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(formSchema.shape.department.Enum).map(
                      (department) => (
                        <SelectItem value={department}>{department}</SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The department section where your product belongs to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="manufacturer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Manufacturer</FormLabel>
                <FormControl>
                  <Input placeholder="Wubblewomp Wonderdome" {...field} />
                </FormControl>
                <FormDescription>
                  The manufacturer of your product
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <NumberInput
                    {...field}
                    placeholder="250"
                    minValue={1}
                    formatOptions={{
                      style: "decimal",
                      maximumFractionDigits: 0,
                    }}
                  />
                </FormControl>
                <FormDescription>
                  The remaining stock in your inventory
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight</FormLabel>
                <FormControl>
                  <NumberInput
                    {...field}
                    placeholder="150 g"
                    minValue={1}
                    formatOptions={{
                      style: "unit",
                      unit: "gram",
                      maximumFractionDigits: 2,
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Your product's weight in grams
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Tell us a little bit about your product
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="imageOne"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary image</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image_1.jpg"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  The primary image that will be displayed in the front page
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-3">
            <div className="flex flex-row items-center gap-3">
              <p className="text-sm font-medium">Secondary images</p>
              <div className="flex flex-row items-center gap-1">
                <CircleMinus
                  size={20}
                  className={`${extra > 0 ? "cursor-pointer" : "stroke-muted-foreground cursor-not-allowed"}`}
                  onClick={() => extra > 0 && setExtra((extra) => extra - 1)}
                />
                <CirclePlus
                  size={20}
                  className={`${extra < 3 ? "cursor-pointer" : "stroke-muted-foreground cursor-not-allowed"}`}
                  onClick={() => extra < 3 && setExtra((extra) => extra + 1)}
                />
              </div>
            </div>
            {extra >= 1 && (
              <FormField
                control={form.control}
                name="imageTwo"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image_2.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {extra >= 2 && (
              <FormField
                control={form.control}
                name="imageThree"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image_3.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {extra >= 3 && (
              <FormField
                control={form.control}
                name="imageFour"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image_3.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
          <Button type="submit" disabled={disabled}>
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
