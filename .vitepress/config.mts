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

    socialLinks: [{ icon: 'github', link: 'https://github.com/YuleBest' }],
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
        href: 'https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Google+Sans+Code:ital,wght@0,300..800;1,300..800&display=swap',
      },
    ],
  ],
})
