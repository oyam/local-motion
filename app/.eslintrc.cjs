module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "plugin:react/recommended",
        "prettier",
    ],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "react/jsx-uses-react": "off",
        "react/react-in-jsx-scope": "off",
        "react/prop-types": [2, { "ignore": ["className", "position", "orientation", "decorative"] }],
        "@typescript-eslint/no-non-null-assertion": "off",
        'no-restricted-imports': [
            'error',
            {
                patterns: ['@/features/*/*'],
            },
        ],
    }
}
