module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/recommended", "@vue/prettier"],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-unused-vars": 0,
    "no-console": 0,
    "indent": [2, 2],
    "semi": "error",
    "no-multiple-empty-lines": ["error", { "max": 1, "maxBOF": 1, "maxEOF": 1 }]
  },
  parserOptions: {
    parser: "babel-eslint"
  }
};
