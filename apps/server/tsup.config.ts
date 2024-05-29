import { defineConfig, type Options } from "tsup";

export default defineConfig((options: Options) => ({
  entryPoints: ["src/index.ts"],
  clean: true,
  format: ["esm"],
  external: [/^@prisma\/.*/],
  noExternal: [/^@repo\/.*/],
  ...options,
}));
