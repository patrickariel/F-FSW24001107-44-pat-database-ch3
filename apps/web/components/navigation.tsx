"use client";

import { LoginDialog } from "./login";
import { NavSheet } from "./nav-sheet";
import { SearchBox } from "@/components/search-box";
import { trpc } from "@/lib/trpc-client";
import { currency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@bingle/ui/avatar";
import { Button } from "@bingle/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@bingle/ui/dropdown-menu";
import { cn } from "@bingle/ui/lib/utils";
import Spinner from "@bingle/ui/spinner";
import { LogOut, ShoppingBag, ShoppingCart, User, Upload } from "lucide-react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense } from "react";

function NavLink({ href, ...props }: Parameters<typeof Link>[0]) {
  const pathname = usePathname();

  return (
    <Link
      href={href}
      className={cn(
        pathname !== href ? "text-muted-foreground" : "",
        "hover:text-primary text-sm font-medium transition-colors",
      )}
      {...props}
    />
  );
}

export function Navigation({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { data: session, status } = useSession();
  const { push } = useRouter();

  const { data: user, isLoading } = trpc.user.get.useQuery(undefined, {
    enabled: session ? true : false,
  });

  return (
    <div className="sticky top-0 z-50 border-b bg-zinc-950">
      <div className="flex flex-row items-center justify-between gap-1 pl-1 pr-3 lg:container sm:gap-2 lg:gap-4">
        <div className="mr-2 flex h-16 items-center md:mr-0 lg:gap-4 lg:pr-4">
          <NavSheet />
          <Link
            href="/"
            className="hover:text-primary flex flex-row items-center space-x-2 text-sm font-medium transition-colors"
          >
            <ShoppingBag />
            <h3 className="hidden text-lg font-semibold md:inline">Bling</h3>
          </Link>
          <nav
            className={cn(
              "hidden items-center space-x-4 lg:flex lg:space-x-6",
              className,
            )}
            {...props}
          >
            <NavLink href="/books">Books</NavLink>
            <NavLink href="/clothing">Clothing</NavLink>
            <NavLink href="/kids">Kids</NavLink>
            <NavLink href="/electronics">Electronics</NavLink>
            <NavLink href="/health">Health</NavLink>
          </nav>
        </div>
        <Suspense>
          <SearchBox />
        </Suspense>
        <div className="flex flex-row items-center justify-end gap-1 md:gap-3 lg:gap-5">
          {status === "loading" || isLoading ? (
            <Spinner size={20} />
          ) : (
            <>
              {status === "authenticated" ? (
                <Button asChild variant="ghost" className="px-2">
                  <Link href="/cart">
                    <ShoppingCart size={20} />
                  </Link>
                </Button>
              ) : (
                <LoginDialog
                  trigger={
                    <Button variant="ghost" className="px-2">
                      <ShoppingCart size={20} />
                    </Button>
                  }
                />
              )}
              {status === "authenticated" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user!.image} />
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="min-w-44 space-y-2"
                  >
                    <DropdownMenuLabel>
                      <div className="flex flex-col gap-4">
                        <p className="text-sm font-medium leading-none">
                          {user!.name}
                        </p>
                        <p className="text-muted-foreground text-xs leading-none">
                          {currency.format(user!.balance)}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex cursor-pointer flex-row gap-2">
                      <User size={17} />
                      <h2>Profile</h2>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex cursor-pointer flex-row gap-2"
                      onClick={() => push("/cart")}
                    >
                      <ShoppingCart size={17} />
                      <h2>Cart</h2>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex cursor-pointer flex-row gap-2"
                      onClick={() => push("/sell")}
                    >
                      <Upload size={17} />
                      <h2>Sell</h2>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex cursor-pointer flex-row gap-2"
                      onClick={async () => await signOut()}
                    >
                      <LogOut size={17} />
                      <h2>Log out</h2>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <LoginDialog
                  trigger={<Button variant="outline">Login</Button>}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
