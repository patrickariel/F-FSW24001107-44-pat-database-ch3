import { cn } from "./lib/utils";
import NextImage from "next/image";
import { useState } from "react";

export function Image({
  onLoad,
  className,
  ...props
}: Parameters<typeof NextImage>[0]) {
  const [loaded, setLoaded] = useState(false);

  return (
    <NextImage
      className={cn(loaded ? "" : "bg-muted animate-pulse", className)}
      onLoad={(event) => {
        setLoaded(true);
        onLoad && onLoad(event);
      }}
      {...props}
    />
  );
}
