module.exports = {
  extends: [
    "eslint-config-react-app",
    "plugin:@tanstack/eslint-plugin-query/recommended",
  ],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "react-router-dom",
            importNames: ["useLocation", "useNavigate"],
            message:
              "Please use useLocation from /src/routes/Router.tsx instead.",
          },
        ],
      },
    ],
  },
};
