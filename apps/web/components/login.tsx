"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@bingle/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@bingle/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@bingle/ui/form";
import { Input } from "@bingle/ui/input";
import { signIn } from "next-auth/react";
import { ReactNode } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export function LoginDialog({
  trigger,
  redirectTo,
}: {
  trigger: ReactNode;
  redirectTo?: string;
}) {
  const formSchema = z.object({
    email: z
      .string()
      .min(1, {
        message: "An e-mail is required.",
      })
      .email({ message: "Not a valid e-mail address." }),
    password: z
      .string()
      .min(1, {
        message: "A password is required.",
      })
      .min(8, {
        message: "Must be 8 characters or more.",
      }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Account is required</DialogTitle>
          <DialogDescription>
            You need to log in before proceeding.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async ({ email, password }) => {
              const response = await signIn("credentials", {
                email,
                password,
                redirect: false,
                redirectTo,
              });
              if (response?.error) {
                form.setError("root", {
                  message:
                    "Sign in failed. Check the details you provided are correct.",
                });
                form.setError("email", {
                  message: "",
                });
                form.setError("password", {
                  message: "",
                });
              } else if (response?.url) {
                window.location.href = response.url;
                if (response.url.includes("#")) window.location.reload();
              }
            })}
            className="space-y-8"
          >
            <FormMessage />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input placeholder="john@smith.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Log in</Button>
          </form>
        </Form>
        {form.formState.errors.root?.message ? (
          <p className="text-destructive text-[0.8rem] font-medium">
            {form.formState.errors.root.message}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
