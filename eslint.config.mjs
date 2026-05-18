import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  {
    ignores: [
      "**/node_modules/**",
      "**/.agents/**",
      "**/.git/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/next-env.d.ts",
      "**/testsprite_tests/**"
    ]
  },
  ...nextVitals,
  ...nextTs,
]);

export default eslintConfig;
