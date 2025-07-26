import js from "@eslint/js";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import prettier from "eslint-plugin-prettier/recommended";
import reactHooks from "eslint-plugin-react-hooks";
import react from "eslint-plugin-react";
import typescript from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default [
  js.configs.recommended,
  ...typescript.configs.recommended,
  ...tanstackQuery.configs["flat/recommended"],
  react.configs.flat.recommended,
  react.configs.flat["jsx-runtime"],
  prettier,
  {
    plugins: {
      "react-hooks": reactHooks,
      import: importPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "import/no-duplicates": "error",
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-router",
              importNames: ["useLocation", "useNavigate"],
              message:
                "Please use useLocation from /src/routes/Router.tsx instead.",
            },
          ],
          patterns: [{ regex: "^@mui/[^/]+$" }],
        },
      ],
    },
  },
];
