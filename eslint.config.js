import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import react from "eslint-plugin-react-x";
import typescript from "typescript-eslint";
import importPlugin from "eslint-plugin-import-x";

export default [
  js.configs.recommended,
  ...typescript.configs.recommended,
  react.configs["recommended-typescript"],
  eslintConfigPrettier,
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
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
