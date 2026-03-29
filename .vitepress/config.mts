import { defineConfig } from 'vitepress'
import { zhConfig } from './locales/zh-CN.mjs'

export default defineConfig({
  ...zhConfig,

  srcDir: 'p',
  outDir: 'dist',

  title: '隐私政策档案馆',
  base: '/',

  themeConfig: {
    ...zhConfig.themeConfig,

    search: {
      provider: 'local',
      options: {
        locales: {
          root: zhConfig.themeConfig!.search!.options!.locales!.root,
        },
      },
    },

    nav: [{ text: '首页', link: '/' }],

    socialLinks: [{ icon: 'github', link: 'https://github.com/YuleBest/privacy-archive' }],
  },

  vite: {
    server: {
      host: '0.0.0.0',
      port: 4568,
    },
  },

  cleanUrls: true,
  ignoreDeadLinks: true,

  lastUpdated: true,

  markdown: {
    config: (md) => {
      const defaultRender =
        md.renderer.rules.heading_close ||
        function (tokens, idx, options, env, self) {
          return self.renderToken(tokens, idx, options)
        }

      md.renderer.rules.heading_close = (tokens, idx, options, env, self) => {
        const result = defaultRender(tokens, idx, options, env, self)
        if (tokens[idx].tag === 'h1') {
          return result + '\n<ArticleMeta />\n'
        }
        return result
      }
    },
  },

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
    },
  },

  head: [
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    ],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: '',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Google+Sans+Code:ital,wght@0,300..800;1,300..800&display=swap',
      },
    ],
  ],
})
