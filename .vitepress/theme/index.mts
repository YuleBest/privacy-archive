import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ArticleMeta from './ArticleMeta.vue'
import Catalog from './Catalog.vue'
import './fonts.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-top': () => h(ArticleMeta),
    })
  },
  enhanceApp({ app }) {
    app.component('ArticleMeta', ArticleMeta as any)
    app.component('Catalog', Catalog as any)
  },
} satisfies Theme
