module.exports = {
  presets: [require('@deepsourcelabs/zeal/tailwind.config')],
  plugins: [require('@tailwindcss/line-clamp')],
  purge: {
    content: [
      './node_modules/@deepsourcelabs/**/*.vue',
      `components/**/*.{vue,js}`,
      `mixins/**/*.{vue,js,ts}`,
      `layouts/**/*.vue`,
      `pages/**/*.vue`,
      `plugins/**/*.{js,ts}`,
      `nuxt.config.{js,ts}`
    ],
    safelist: [
      'text-vanilla-100',
      'text-vanilla-200',
      'text-vanilla-300',
      'text-vanilla-400',
      'text-ink-100',
      'text-ink-200',
      'text-ink-300',
      'text-ink-400',
      'text-juniper',
      'text-cherry',
      'text-current',
      'bg-gitlab',
      'bg-bitbucket'
    ]
  },
  variants: {
    extend: {
      translate: ['group-hover'],
      cursor: ['hover'],
      borderStyle: ['hover', 'focus'],
      animation: ['motion-safe']
    }
  },
  theme: {
    extend: {
      spacing: {
        84: '21rem',
        88: '22rem',
        92: '23rem',
        98: '27rem'
      },
      gridTemplateColumns: {
        support: '5fr 7fr',
        discover: '8fr 4fr'
      },
      height: {
        'nav-sidebar': 'calc(100vh - 96px)'
      }
    }
  }
}
