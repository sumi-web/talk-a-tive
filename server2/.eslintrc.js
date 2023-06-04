module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  plugins: ['unicorn', 'prettier'],
  extends: ['standard-with-typescript', 'prettier'],
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
  },
  rules: {
    'prettier/prettier': ['error'],
    'unicorn/filename-case': [
      'warn',
      {
        case: 'kebabCase',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-extraneous-class': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off',
    'import/order': 'error',
  },
  ignorePatterns: [],
};
