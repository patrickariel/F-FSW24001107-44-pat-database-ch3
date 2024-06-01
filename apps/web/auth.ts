import { db } from "@bingle/db";
import bcrypt from "bcryptjs";
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

          const user = await db.user.findUnique({
            where: { email },
          });

          if (!user) {
            return null;
          }

          if (await bcrypt.compare(password, user.password)) {
            return user;
          } else {
            return null;
          }
        } catch (error) {
          console.log(error);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
});
