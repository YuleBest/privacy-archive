import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ArticleMeta from './ArticleMeta.vue'
import './fonts.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ArticleMeta', ArticleMeta as any)
  },
} satisfies Theme
