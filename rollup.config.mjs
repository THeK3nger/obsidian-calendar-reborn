import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import { env } from "process";

// Dev builds: `npm run dev` (passes `--environment DEV`). Anything else is production.
const isDev = Boolean(env.DEV);

export default {
  input: "src/main.ts",
  output: {
    format: "cjs",
    file: "main.js",
    exports: "default",
    sourcemap: isDev ? "inline" : false,
  },
  external: ["obsidian", "fs", "os", "path"],
  onwarn(warning, warn) {
    // Svelte's own runtime has internal import cycles; they are harmless.
    if (
      warning.code === "CIRCULAR_DEPENDENCY" &&
      warning.ids?.every((id) => id.includes("node_modules"))
    ) {
      return;
    }
    warn(warning);
  },
  plugins: [
    svelte({
      emitCss: false,
      compilerOptions: { dev: isDev },
    }),
    typescript({ sourceMap: isDev }),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    !isDev && terser({ format: { comments: false } }),
  ],
};
