module.exports = {
    env: {
        browser: true,
        es6: true,
        node: true,
        jest: true,
    },
    extends: [
        'plugin:vue/essential',
        'airbnb-base',
        'plugin:jest/recommended',
    ],
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    plugins: [
        'vue',
        'jest',
    ],
    rules: {
        'arrow-parens': ['error', 'as-needed'],
        'consistent-return': 0,
        indent: ['error', 4, {SwitchCase: 1}],
        'linebreak-style': 0,
        'no-console': 0,
        'no-debugger': 0,
        'no-param-reassign': 0,
        'no-restricted-globals': 0,
        'object-curly-spacing': ['error', 'never'],
        quotes: ['error', 'single', {allowTemplateLiterals: true}],
    },
};
