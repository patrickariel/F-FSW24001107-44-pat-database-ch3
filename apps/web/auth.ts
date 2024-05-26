import trpc from "@/lib/trpc";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await z
            .object({ email: z.string().email(), password: z.string().min(6) })
            .parseAsync(credentials);

          return await trpc.user.auth.mutate({ email, password });
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
});
