import { FlatCompat } from '@eslint/eslintrc'
import tseslint from '@typescript-eslint/eslint-plugin'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})


const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  }),
];
     
    

export default eslintConfig
