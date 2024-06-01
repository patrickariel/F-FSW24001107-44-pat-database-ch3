import baseConfig from "@bingle/tailwind-config";
import type { Config } from "tailwindcss";

const config = {
  ...baseConfig,
  content: ["./src/**/*.{ts,tsx}"],
} satisfies Config;

export default config;
