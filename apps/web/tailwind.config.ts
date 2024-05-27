import baseConfig from "@repo/tailwind-config";
import type { Config } from "tailwindcss";

const config = {
  ...baseConfig,
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*{.js,.ts,.jsx,.tsx}",
  ],
} satisfies Config;

export default config;
