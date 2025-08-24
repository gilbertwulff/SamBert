module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Disable some strict rules for deployment
    "@typescript-eslint/no-unused-vars": "warn",
    "react-hooks/exhaustive-deps": "warn",
    // Allow some flexibility with types during rapid development
    "@typescript-eslint/no-explicit-any": "off",
    "react/no-unescaped-entities": "off",
  },
};
