"use client";

import { LoginDialog } from "./login";
import { trpc } from "@/lib/trpc-client";
import { currency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/avatar";
import { Button } from "@repo/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/dropdown-menu";
import { cn } from "@repo/ui/lib/utils";
import Spinner from "@repo/ui/spinner";
import { skipToken } from "@tanstack/react-query";
import { LogOut, Menu, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

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

  const { data: user, isLoading } = trpc.user.getByEmail.useQuery(
    session?.user?.email
      ? {
          email: session.user.email,
        }
      : skipToken,
  );

  useEffect(() => {}, [session]);

  return (
    <div className="sticky top-0 z-50 border-b bg-zinc-950">
      <div className="flex flex-row items-center justify-between space-x-4 px-3 lg:container">
        <div className="flex h-16 items-center gap-4 lg:px-4">
          <Button variant="ghost" className="px-2 lg:hidden">
            <Menu className="stroke-zinc-400" />
          </Button>
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
        <div className="flex flex-row items-center justify-end space-x-5">
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
                    <DropdownMenuItem className="flex cursor-pointer flex-row gap-2">
                      <ShoppingCart size={17} />
                      <h2>Cart</h2>
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
