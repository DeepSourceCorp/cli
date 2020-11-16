export default {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'bifrost',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: ['~/plugins/helpers/store.ts', '~/plugins/helpers/values.ts'],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-analytics',
    '@nuxtjs/google-fonts'
  ],

  serverMiddleware: ['~/api'],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: ['@nuxtjs/apollo', 'cookie-universal-nuxt'],

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {},

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.scss'
  },

  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700]
    }
  },

  apollo: {
    includeNodeModules: true,
    clientConfigs: {
      default: '@/apollo/config/index.ts'
    }
  },

  vue: {
    config: {
      transpileDependencies: []
    }
  }
}
