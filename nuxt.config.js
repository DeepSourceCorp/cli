function toBool(item) {
  switch (typeof item) {
    case 'boolean':
      return item
    case 'function':
      return true
    case 'number':
      return item > 0 || item < 0
    case 'object':
      return !!item
    case 'string':
      item = item.toLowerCase()
      return ['true', '1'].includes(item)
    case 'symbol':
      return true
    case 'undefined':
      return false

    default:
      throw new TypeError('Unrecognised type: unable to convert to boolean')
  }
}

import { version } from './package.json'

const IS_ON_PREM = toBool(process.env.ON_PREM)
const IS_CLOUD_PRODUCTION =
  !IS_ON_PREM && process.env.NODE_ENV === 'production' && process.env.BIFROST_ENV === 'production'
const IS_STAGING =
  !IS_ON_PREM && process.env.NODE_ENV === 'production' && process.env.BIFROST_ENV === 'staging'
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
const APP_DOMAIN = process.env.DEEPSOURCE_DOMAIN ?? 'app.deepsource.com'
const DEFAULT_PUBLIC_PATH = '/_nuxt/'

export default {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    htmlAttrs: {
      lang: 'en'
    },
    title: 'DeepSource',
    bodyAttrs: {
      class: 'antialiased stroke-2'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { hid: 'og:type', property: 'og:type', content: 'website' }
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon/default.svg',
        media: '(prefers-color-scheme: light)'
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon/default-dark.svg',
        media: '(prefers-color-scheme: dark)'
      }
    ],
    script: IS_ON_PREM
      ? []
      : [
          {
            src: 'https://betteruptime.com/widgets/announcement.js',
            'data-id': '145541',
            async: 'async'
          }
        ]
  },
  telemetry: false,
  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
    '@deepsource/zeal/dist/typography.css',
    '@deepsource/zeal/dist/chart.css',
    '@assets/css/default.scss',
    '@deepsource/zeal/src/assets/css/syntax_highlighter.css', // remove this after ZCode export fix
    '@assets/css/floating_vue.scss'
  ],

  // https://nuxtjs.org/blog/moving-from-nuxtjs-dotenv-to-runtime-config
  // https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-runtime-config
  publicRuntimeConfig: {
    apolloClientUri: process.env.APOLLO_CLIENT_URI,
    restClientUri: process.env.REST_CLIENT_URI,
    csrfClientUri: process.env.CSRF_CLIENT_URI,
    websocket: {
      url: process.env.WEB_SOCKET_URI || 'wss://sockets.deepsource.com'
    },
    onPrem: IS_ON_PREM,
    gitlabEnabled: IS_ON_PREM ? toBool(process.env.GITLAB_ENABLED) : true,
    githubEnabled: IS_ON_PREM ? toBool(process.env.GITHUB_ENABLED) : true,
    bitbucketEnabled: IS_ON_PREM ? toBool(process.env.BITBUCKET_ENABLED) : true,
    githubServerEnabled: IS_ON_PREM ? toBool(process.env.GHE_SERVER_ENABLED) : false,
    gsrEnabled: IS_ON_PREM ? toBool(process.env.GSR_ENABLED) : false,
    adsEnabled: IS_ON_PREM ? toBool(process.env.ADS_ENABLED) : true,
    enableSaml: toBool(process.env.ENABLE_SAML),
    emailEnabled: IS_ON_PREM ? toBool(process.env.EMAIL_ENABLED) : true,
    allowSocialAuth: IS_ON_PREM ? toBool(process.env.ALLOW_SOCIAL_AUTH) : true,
    licenseExpiry: IS_ON_PREM ? new Date(process.env.LICENSE_EXPIRY) : null,
    supportEmail: IS_ON_PREM ? 'enterprise-support@deepsource.io' : 'support@deepsource.io',
    domain: APP_DOMAIN,
    rudderWriteKey: IS_ON_PREM ? '' : process.env.RUDDER_WRITE_KEY,
    rudderDataPlaneUrl: IS_ON_PREM ? '' : process.env.RUDDER_DATA_PLANE_URL,
    nodeEnv: process.env.NODE_ENV,
    bifrostEnv: process.env.BIFROST_ENV
  },

  privateRuntimeConfig: {
    apolloServerUri: process.env.APOLLO_SERVER_URI,
    csrfServerUri: process.env.CSRF_SERVER_URI
  },

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '~/plugins/helpers/store.ts',
    '~/plugins/helpers/provider.ts',
    '~/plugins/helpers/generateRoute.ts',
    '~/plugins/helpers/highlight.ts',
    '~/plugins/helpers/filters.ts',
    '~/plugins/helpers/gateKeeper.ts',
    '~/plugins/helpers/clipboard.client.ts',
    '~/plugins/helpers/outsideClick.client.ts',
    '~/plugins/helpers/directives.client.ts',
    '~/plugins/helpers/localstorage.client.ts',
    '~/plugins/helpers/error.ts',
    '~/plugins/helpers/storage.client.ts',
    '~/plugins/helpers/worker.client.ts',
    '~/plugins/components/toasts.client.ts',
    '~/plugins/components/floatingVue.ts',
    '~/plugins/components/palette.client.ts'
  ],

  stripe: {
    publishableKey: process.env.STRIPE_KEY
  },

  extendPlugins(plugins) {
    const services = ['~/plugins/services/rudder.client.ts']

    if (!IS_ON_PREM) {
      plugins.push(...services)
    }

    return plugins
  },

  ignore: IS_ON_PREM
    ? [
        '**/_provider/_owner/settings/billing/*',
        '**/_provider/_owner/settings/security.vue',
        '**/accounts/ads/login/*',
        '**/components/Settings/Security/*',
        '**/components/Billing/*',
        '**/discover/*',
        '**/request-pilot-license.vue',
        '**/components/Content/PilotEvaluationAgreement.vue'
      ]
    : [],

  loadingIndicator: {
    name: 'pulse',
    color: '#f5f5f5',
    background: '#121317'
  },

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: [{ path: '~/components', pathPrefix: false, extensions: ['vue'] }],

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/tailwindcss
    '@nuxtjs/tailwindcss',
    '@deepsource/nuxt-websocket',
    '@nuxtjs/google-fonts',
    ...(IS_ON_PREM ? [] : ['@nuxtjs/gtm'])
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    '@nuxtjs/apollo',
    '@nuxtjs/sitemap',
    'cookie-universal-nuxt',
    '@nuxt/content',
    'portal-vue/nuxt',
    ...(IS_ON_PREM ? [] : ['nuxt-stripe-module']),
    ...(!IS_DEVELOPMENT && !IS_ON_PREM ? ['nuxt-prometheus-module'] : []),
    ...(IS_CLOUD_PRODUCTION || IS_DEVELOPMENT || IS_STAGING ? ['@nuxtjs/sentry'] : [])
  ],

  sentry: {
    dsn: process.env.BIFROST_SENTRY_DSN,
    tracing: {
      tracesSampleRate: 0.1,
      vueOptions: {
        trackComponents: true
      }
    },
    disabled: IS_DEVELOPMENT || IS_STAGING,
    logMockCalls: IS_DEVELOPMENT || IS_STAGING,
    config: {
      environment: process.env.BIFROST_ENV
    },
    publishRelease: IS_CLOUD_PRODUCTION
      ? {
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: 'deepsource',
          project: 'bifrost',
          release: process.env.COMMIT_SHA,
          include: '.nuxt/dist/',
          setCommits: {
            commit: process.env.COMMIT_SHA,
            repo: 'deepsourcelabs/bifrost'
          }
        }
      : false,
    sourceMapStyle: 'hidden-source-map'
  },

  'nuxt-prometheus-module': {
    host: IS_DEVELOPMENT ? '127.0.0.1' : '0.0.0.0',
    port: 9100,
    metrics: {
      collectDefault: true,
      requestDuration: false
    }
  },

  serverMiddleware: [
    {
      path: '/healthz',
      handler: '~/server/health.ts'
    },
    {
      path: '/directory',
      handler: '~/server/directoryRedirects.ts',
      prefix: false
    }
  ],

  sitemap: {
    path: '/sitemap-bifrost.xml',
    gzip: true,
    exclude: ['**/*', '/'],
    routes: [
      {
        url: '/discover',
        changefreq: 'daily',
        priority: 1
      },
      {
        url: '/directory',
        changefreq: 'daily',
        priority: 1
      },
      {
        url: '/login',
        changefreq: 'weekly',
        priority: 1
      },
      {
        url: '/signup',
        changefreq: 'weekly',
        priority: 1
      }
    ]
  },

  router: {
    middleware: ['auth', 'licenseValidation'],
    extendRoutes(routes, resolve) {
      //! In case of updates to `meta.provider`, update corresponding data in `plugins/helpers/provider.ts` as well.
      routes.push({
        name: 'github',
        path: '/accounts/github/login/callback/bifrost',
        component: resolve(__dirname, 'pages/auth/-index.vue'),
        chunkName: 'pages/auth',
        meta: { provider: 'github' }
      })
      routes.push({
        name: 'github-enterprise',
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
      routes.push({
        name: 'gsr',
        path: '/accounts/google/login/callback/bifrost',
        component: resolve(__dirname, 'pages/auth/-index.vue'),
        chunkName: 'pages/auth',
        meta: { provider: 'google-oauth2' }
      })
      routes.push({
        name: 'ads',
        path: '/accounts/ads/login/callback/bifrost',
        component: resolve(__dirname, 'pages/auth/-index.vue'),
        chunkName: 'pages/auth',
        meta: { provider: 'ads-oauth2' }
      })
    }
  },

  modern: IS_DEVELOPMENT ? false : 'client',

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  // TODO: Remove this configuration
  // https://github.com/nuxt-community/tailwindcss-module/issues/79#issuecomment-609693459
  build: {
    publicPath: IS_CLOUD_PRODUCTION ? process.env.CDN_URL : DEFAULT_PUBLIC_PATH,
    devtools: IS_STAGING,
    cache: true,
    sourceMap: true,
    extractCSS: !IS_DEVELOPMENT,
    postcss: {
      preset: {
        features: {
          'focus-within-pseudo-class': false
        }
      }
    },
    extend(config, { isClient }) {
      if (isClient) {
        config.devtool = 'source-map'
      }

      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader'
      })

      config.performance.maxEntrypointSize = 8 * 1024 * 1024 // 8MB
      config.performance.maxAssetSize = 4 * 1024 * 1024 // 4MB
    }
  },

  render: {
    // https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-render#fallback
    fallback: {
      static: {
        handlers: false
      }
    }
  },

  googleFonts: {
    download: !IS_DEVELOPMENT,
    families: {
      Inter: [100, 200, 300, 400, 500, 600, 700]
    }
  },

  gtm: {
    id: 'GTM-K34VXB5',
    enabled: IS_CLOUD_PRODUCTION,
    pageTracking: true
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
      // productionTip: false,
      // devtools: true
    }
  }
}
