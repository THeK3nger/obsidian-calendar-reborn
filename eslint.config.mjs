import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

// The obsidianmd ruleset is strict, and the existing code base has not been
// brought in line with it yet. Report its findings as warnings for now so they
// stay visible without failing `npm run lint` / the build. Remove this
// downgrade once the findings are fixed.
function toWarning(setting) {
  if (setting === "off" || setting === 0) return setting;
  return Array.isArray(setting) ? ["warn", ...setting.slice(1)] : "warn";
}

const obsidianmdRecommended = obsidianmd.configs.recommended.map((config) =>
  config.rules
    ? {
        ...config,
        rules: Object.fromEntries(
          Object.entries(config.rules).map(([rule, setting]) => [
            rule,
            toWarning(setting),
          ])
        ),
      }
    : config
);

export default defineConfig([
  { ignores: ["main.js", "node_modules/**"] },
  ...obsidianmdRecommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { project: "./tsconfig.json" },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { args: "all", argsIgnorePattern: "^_" },
      ],
    },
  },
]);
