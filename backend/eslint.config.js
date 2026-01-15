import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    plugins: { js },
    languageOptions: {
      globals: {
        ...globals.browser,  // for frontend
        ...globals.node      // add this for backend compatibility
      }
    },
    extends: ["js/recommended"]
  },
  pluginReact.configs.flat.recommended
]);
