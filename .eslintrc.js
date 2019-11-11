module.exports = {
  "env": {
      "browser": true,
      "es6": true
  },
  "extends": "airbnb-base",
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018,
    "sourceType": "module"
  },
  "rules": {
    "max-classes-per-file": "off",
    "no-bitwise": "off",
    "no-underscore-dangle": "off",
    "linebreak-style": ["error", "windows"]
  }
}