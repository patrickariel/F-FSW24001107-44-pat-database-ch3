import { Slot } from "@radix-ui/react-slot";
import { Button } from "@repo/ui/button";
import { cn } from "@repo/ui/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import * as React from "react";

interface ContentSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  href: string;
  linkText?: string;
  children: React.ReactNode;
  asChild?: boolean;
}

export function ContentSection({
  title,
  description,
  href,
  linkText,
  children,
  className,
  asChild = false,
  ...props
}: ContentSectionProps) {
  const ChildrenShell = asChild ? Slot : "div";

  return (
    <section className={cn("space-y-6", className)} {...props}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex max-w-[61.25rem] flex-1 flex-col gap-0.5">
          <h2 className="text-2xl font-bold leading-[1.1] md:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="text-muted-foreground max-w-[46.875rem] text-balance text-xs leading-normal sm:text-base sm:leading-7">
              {description}
            </p>
          ) : null}
        </div>
        {linkText ? (
          <Button variant="outline" className="hidden sm:flex" asChild>
            <Link href={href}>
              {linkText}
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              <span className="sr-only"> {linkText}</span>
            </Link>
          </Button>
        ) : null}
      </div>
      <div className="space-y-8">
        <ChildrenShell
          className={cn(
            !asChild &&
              "grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
          )}
        >
          {children}
        </ChildrenShell>
        {linkText ? (
          <Button
            variant="ghost"
            className="mx-auto flex w-fit sm:hidden"
            asChild
          >
            <Link href={href}>
              {linkText}
              <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              <span className="sr-only"> {linkText}</span>
            </Link>
          </Button>
        ) : null}
      </div>
    </section>
  );
}
