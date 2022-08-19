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
const IS_PRODUCTION = process.env.NODE_ENV === 'prod'
const IS_ON_PREM = toBool(process.env.ON_PREM)
const APP_DOMAIN = process.env.DEEPSOURCE_DOMAIN ?? 'deepsource.io'
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
    ]
  },
  telemetry: false,
  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [
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
    websocket: {
      url: process.env.WEB_SOCKET_URI || 'wss://events.deepsource.io'
    },
    onPrem: IS_ON_PREM,
    gitlabEnabled: IS_ON_PREM ? toBool(process.env.GITLAB_ENABLED) : true,
    githubEnabled: IS_ON_PREM ? toBool(process.env.GITHUB_ENABLED) : true,
    bitbucketEnabled: IS_ON_PREM ? toBool(process.env.BITBUCKET_ENABLED) : true,
    githubServerEnabled: IS_ON_PREM ? toBool(process.env.GHE_SERVER_ENABLED) : false,
    gsrEnabled: IS_ON_PREM ? toBool(process.env.GSR_ENABLED) : false,
    enableSaml: toBool(process.env.ENABLE_SAML),
    emailEnabled: IS_ON_PREM ? toBool(process.env.EMAIL_ENABLED) : true,
    allowSocialAuth: IS_ON_PREM ? toBool(process.env.ALLOW_SOCIAL_AUTH) : true,
    licenseExpiry: IS_ON_PREM ? new Date(process.env.LICENSE_EXPIRY) : null,
    supportEmail: IS_ON_PREM ? 'enterprise-support@deepsource.io' : 'support@deepsource.io',
    discoverEnabled: IS_ON_PREM ? toBool(process.env.IS_DISCOVER_ENABLED) : true,
    domain: APP_DOMAIN,
    rudderWriteKey: IS_ON_PREM ? '' : process.env.RUDDER_WRITE_KEY,
    rudderDataPlaneUrl: IS_ON_PREM ? '' : process.env.RUDDER_DATA_PLANE_URL
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
    '~/plugins/components/tooltip.ts',
    '~/plugins/components/palette.client.ts'
  ],

  stripe: {
    publishableKey: process.env.STRIPE_KEY
  },

  extendPlugins(plugins) {
    const services = [
      '~/plugins/services/rudder.client.ts',
      '~/plugins/components/statuspage.client.ts'
    ]

    if (!IS_ON_PREM) {
      plugins.push(...services)
    }

    return plugins
  },

  ignore: IS_ON_PREM
    ? [
        '**/_provider/_owner/settings/billing/*',
        '**/components/Billing/*',
        '**/settings/integrations/*'
      ]
    : [],

  loadingIndicator: {
    name: 'pulse',
    color: '#f5f5f5',
    background: '#16181D'
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
    ...(process.env.NODE_ENV !== 'development' && !IS_ON_PREM ? ['nuxt-prometheus-module'] : []),
    ...(process.env.BUGSNAG_TOKEN && !IS_ON_PREM ? ['nuxt-bugsnag'] : [])
  ],

  'nuxt-prometheus-module': {
    host: process.env.NODE_ENV === 'development' ? '127.0.0.1' : '0.0.0.0',
    port: 9100,
    metrics: {
      collectDefault: true,
      requestDuration: false
    }
  },

  bugsnag: {
    config: {
      appVersion: version
    },
    releaseStage: process.env.NODE_ENV,
    apiKey: process.env.BUGSNAG_TOKEN,
    publishRelease: true,
    reporterOptions: {
      autoAssignRelease: true
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
    }
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  // TODO: Remove this configuration
  // https://github.com/nuxt-community/tailwindcss-module/issues/79#issuecomment-609693459
  build: {
    publicPath: IS_PRODUCTION ? process.env.CDN_URL : DEFAULT_PUBLIC_PATH,
    parallel: true,
    cache: true,
    sourceMap: true,
    extractCSS: process.env.NODE_ENV !== 'development',
    optimization: {
      splitChunks: {
        cacheGroups: {
          styles: {
            name: 'styles',
            test: /\.(css|vue)$/,
            chunks: 'all',
            enforce: true
          }
        }
      }
    },
    postcss: {
      preset: {
        features: {
          'focus-within-pseudo-class': false
        }
      }
    },
    extend(config) {
      if (process.env.NODE_ENV === 'development') {
        config.devtool = 'source-map'
      }

      config.module.rules.push({
        test: /\.(ogg|mp3|wav|mpe?g)$/i,
        loader: 'file-loader'
      })
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
    download: process.env.NODE_ENV !== 'development',
    families: {
      Inter: [100, 200, 300, 400, 500, 600, 700]
    }
  },

  gtm: {
    id: 'GTM-K34VXB5',
    enabled: IS_PRODUCTION && !IS_ON_PREM,
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
    }
  }
}
