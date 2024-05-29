import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entry: ["app/index.ts"],
  clean: true,
  format: ["esm"],
  external: [/^@prisma\/.*/],
  noExternal: [/^@repo\/.*/],
  ...options,
}));
