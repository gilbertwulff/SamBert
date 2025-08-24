module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    // Disable strict rules for deployment
    "@typescript-eslint/no-unused-vars": "off",
    "react-hooks/exhaustive-deps": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "react/no-unescaped-entities": "off",
  },
};
