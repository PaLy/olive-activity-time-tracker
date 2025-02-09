import js from "@eslint/js";
import tanstackQuery from "@tanstack/eslint-plugin-query";
import prettier from "eslint-plugin-prettier/recommended";
import typescript from "typescript-eslint";

export default [
  ...typescript.config(js.configs.recommended, typescript.configs.recommended),
  ...tanstackQuery.configs["flat/recommended"],
  prettier,
  {
    rules: {
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
        },
      ],
    },
  },
];
