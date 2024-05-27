"use client";

import { trpc } from "../lib/trpc-client";

export { SessionProvider as ClientSessionProvider } from "next-auth/react";

export const ClientTrpcProvider = trpc.withTRPC(
  (props: React.PropsWithChildren) => props.children,
) as React.ComponentType<React.PropsWithChildren>;
