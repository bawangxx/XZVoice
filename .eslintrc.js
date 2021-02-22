module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-unused-vars': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-unreachable': process.env.NODE_ENV === 'production' ? 'off' : 'off',
    'no-empty': process.env.NODE_ENV === 'production' ? 'off' : 'off',
  },
  "globals": { "__static": true }, //参考：https://stackoverflow.com/questions/45317154/error-is-not-defined-no-undef/46100803
}
