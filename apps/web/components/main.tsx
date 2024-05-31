"use client";

import { Navigation } from "./navigation";
import { usePathname } from "next/navigation";

export function Main({ children }: React.HTMLProps<HTMLElement>) {
  const pathname = usePathname();

  return (
    <div
      className={`flex ${pathname === "/cart" ? "h-screen" : "min-h-screen"} flex-col`}
    >
      <Navigation />
      {children}
    </div>
  );
}
