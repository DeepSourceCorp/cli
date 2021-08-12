export default {
  ssr: false,
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'DeepSource',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon-dark.png' }]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
    '@deepsourcelabs/zeal/dist/tailwind.css',
    '@deepsourcelabs/zeal/dist/layout.css',
    '@deepsourcelabs/zeal/dist/typography.css',
    '@deepsourcelabs/zeal/dist/chart.css',
    '@assets/css/default.scss',
    '@deepsourcelabs/zeal/src/assets/css/syntax_highlighter.css', // remove this after ZCode export fix
    '@assets/css/tooltip.scss'
  ],

  // https://nuxtjs.org/blog/moving-from-nuxtjs-dotenv-to-runtime-config
  // https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-runtime-config
  publicRuntimeConfig: {
    apolloServerUri: process.env.APOLLO_SERVER_URI,
    apolloClientUri: process.env.APOLLO_CLIENT_URI,
    csrfServerUri: process.env.CSRF_SERVER_URI,
    csrfClientUri: process.env.CSRF_CLIENT_URI,
    webSocketUri: process.env.WEB_SOCKET_URI,
    onPrem: Boolean(process.env.ON_PREM),
    gitlabEnabled: process.env.ON_PREM ? process.env.GITLAB_ENABLED : true,
    githubEnabled: process.env.ON_PREM ? process.env.GITHUB_ENABLED : true,
    bitbucketEnabled: process.env.ON_PREM ? process.env.BITBUCKET_ENABLED : true,
    githubServerEnabled: process.env.ON_PREM ? process.env.GHE_SERVER_ENABLED : false,
    enableSaml: Boolean(process.env.ENABLE_SAML),
    allowSocialAuth: process.env.ON_PREM ? process.env.ALLOW_SOCIAL_AUTH : true,
    stripe: {
      publishableKey: process.env.ON_PREM ? '' : process.env.STRIPE_KEY
    },
    googleAnalytics: {
      id: process.env.ON_PREM ? '' : process.env.GOOGLE_ANALYTICS_ID
    },
    supportEmail: process.env.ON_PREM
      ? 'enterprise-support@deepsource.io'
      : 'support@deepsource.io',
    sentry: {
      clientConfig: {
        disabled: true
      },
      serverConfig: {
        disabled: true
      }
    }
  },

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '~/plugins/helpers/store.ts',
    '~/plugins/helpers/provider.ts',
    '~/plugins/helpers/generateRoute.ts',
    '~/plugins/helpers/highlight.ts',
    '~/plugins/helpers/gateKeeper.ts',
    '~/plugins/helpers/websocket.client.ts',
    '~/plugins/helpers/clipboard.client.ts',
    '~/plugins/helpers/outsideClick.client.ts',
    '~/plugins/helpers/localstorage.client.ts',
    '~/plugins/components/toasts.client.ts',
    '~/plugins/components/tooltip.ts'
  ],

  sentry: {
    publishRelease: false,
    sourceMapStyle: 'hidden-source-map',
    disabled: true
  },

  extendPlugins(plugins) {
    const services = [
      '~/plugins/services/fullstory.js',
      '~/plugins/services/rudderLoader.client.js',
      '~/plugins/services/rudder.client.ts'
    ]

    if (!process.env.ON_PREM) {
      plugins.push(...services)
    }

    return plugins
  },

  ignore: process.env.ON_PREM
    ? ['**/_provider/_owner/settings/billing/*', '**/components/Billing/*']
    : [],

  loadingIndicator: {
    name: 'pulse',
    color: '#f5f5f5',
    background: '#16181D'
  },

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts'
    ...(process.env.ON_PREM ? [] : ['@nuxtjs/google-analytics'])
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    '@nuxtjs/apollo',
    'cookie-universal-nuxt',
    '@nuxt/content',
    'portal-vue/nuxt',
    ...(process.env.ON_PREM ? [] : ['@nuxtjs/sentry', 'nuxt-stripe-module'])
  ],

  serverMiddleware: [
    {
      path: '/healthz',
      handler: '~/server/health'
    }
  ],

  router: {
    middleware: ['auth'],
    extendRoutes(routes, resolve) {
      routes.push({
        name: 'github',
        path: '/accounts/github/login/callback/bifrost',
        component: resolve(__dirname, 'pages/auth/-index.vue'),
        chunkName: 'pages/auth',
        meta: { provider: 'github' }
      })
      routes.push({
        name: 'github',
        path: '/accounts/github-enterprise/login/callback/bifrost',
        component: resolve(__dirname, 'pages/auth/-index.vue'),
        chunkName: 'pages/auth',
        meta: { provider: 'github-enterprise' }
      })
      routes.push({
        name: 'bitbucket',
        path: '/accounts/bitbucket_oauth2/login/callback/bifrost',
        component: resolve(__dirname, 'pages/auth/-index.vue'),
        chunkName: 'pages/auth',
        meta: { provider: 'bitbucket-oauth2' }
      })
      routes.push({
        name: 'gitlab',
        path: '/accounts/gitlab/login/callback/bifrost',
        component: resolve(__dirname, 'pages/auth/-index.vue'),
        chunkName: 'pages/auth',
        meta: { provider: 'gitlab' }
      })
    }
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  // TODO: Remove this configuration
  // https://github.com/nuxt-community/tailwindcss-module/issues/79#issuecomment-609693459
  build: {
    parallel: true,
    cache: true,
    sourceMap: true,
    postcss: {
      preset: {
        features: {
          'focus-within-pseudo-class': false
        }
      }
    }
  },

  googleFonts: {
    download: true,
    families: {
      Inter: [100, 200, 300, 400, 500, 600, 700]
    }
  },

  apollo: {
    includeNodeModules: true,
    clientConfigs: {
      default: '@/apollo/config/client.ts'
    }
  },

  vue: {
    config: {
      transpileDependencies: []
    }
  }
}
