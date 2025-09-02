 { dirname } from "path";
 { fileURLToPath } from "url";
 { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
