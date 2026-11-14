import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { env } from "process";

export default {
  input: "src/main.ts",
  output: {
    format: "cjs",
    file: "main.js",
    exports: "default",
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
    }),
    typescript({ sourceMap: env.env === "DEV" }),
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
  ],
};
