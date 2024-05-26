"use client";

import { AspectRatio } from "@repo/ui/aspect-ratio";
import { Card, CardContent, CardHeader } from "@repo/ui/card";
import Image from "next/image";
import { trpc } from "web/lib/trpc-client";
import { uuidTranslator } from "web/lib/utils";

export default function Page({ params: { id } }: { params: { id: string } }) {
  const { data: product } = trpc.product.get.useQuery({
    id: uuidTranslator.toUUID(id),
  });

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Card className="size-full overflow-hidden rounded-md">
        <CardHeader className="cursor-pointer border-b p-0">
          <AspectRatio ratio={4 / 3}>
            <Image
              src={product.images[0]!}
              alt={product.name}
              className="object-cover"
              sizes="(min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, (min-width: 475px) 50vw, 100vw"
              fill
              loading="lazy"
            />
          </AspectRatio>
        </CardHeader>
        <CardContent className="select-none space-y-2 px-4 py-3">
          <h2 className="line-clamp-1 cursor-pointer font-semibold">
            {product.name}
          </h2>
          <p className="text-muted-foreground line-clamp-1 text-xs">
            ${product.price}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
