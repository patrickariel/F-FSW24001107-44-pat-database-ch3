import "./globals.css";
import { Navigation } from "@/components/navigation";
import {
  ClientSessionProvider,
  ClientTrpcProvider,
} from "@/components/providers";
import { Toaster } from "@repo/ui/toaster";
import { TooltipProvider } from "@repo/ui/tooltip";
import type { Metadata } from "next";
import { Comfortaa } from "next/font/google";

const font = Comfortaa({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bingle Shop",
  description: "Elevate your shopping experience",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" className="dark">
      <body className={font.className}>
        <ClientTrpcProvider>
          <ClientSessionProvider>
            <TooltipProvider>
              <div className="flex h-screen flex-col">
                <Navigation />
                {children}
              </div>
              <Toaster />
            </TooltipProvider>
          </ClientSessionProvider>
        </ClientTrpcProvider>
      </body>
    </html>
  );
}
