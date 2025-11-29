import { configApp } from '@adonisjs/eslint-config'
export default {
  ...configApp,
  rules: {
    'prettier/prettier': 0,
  },
}
