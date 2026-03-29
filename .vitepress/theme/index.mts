import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import ArticleMeta from './ArticleMeta.vue'
import Catalog from './Catalog.vue'
import Breadcrumb from './Breadcrumb.vue'
import DiffViewer from './DiffViewer.vue'
import './fonts.css'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'aside-top': () => h(ArticleMeta),
      'doc-before': () => h(Breadcrumb),
    })
  },
  enhanceApp({ app }) {
    app.component('ArticleMeta', ArticleMeta as any)
    app.component('Catalog', Catalog as any)
    app.component('Breadcrumb', Breadcrumb as any)
    app.component('DiffViewer', DiffViewer as any)
  },
} satisfies Theme
