import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["docs/**", "node_modules/**"],
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];
