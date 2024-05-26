import baseConfig from "@repo/tailwind-config";
import type { Config } from "tailwindcss";

const config = {
  ...baseConfig,
  content: ["./src/**/*.{ts,tsx}"],
} satisfies Config;

export default config;
