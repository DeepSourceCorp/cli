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
  plugins: [],

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

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: ['@nuxtjs/apollo'],

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
    clientConfigs: {
      default: {
        httpEndpoint: 'http://localhost:9002/graphql',
        httpLinkOptions: {
          fetchOptions: {
            mode: 'cors' //Cors Needed for external Cross origins, need to allow headers from server
          },
          credentials: 'omit' //must be omit to support application/json content type
        }
      }
    }
  },

  vue: {
    config: {
      transpileDependencies: []
    }
  }
}
