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
    options: {
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
        'text-robin',
        'text-honey',
        'bg-gitlab',
        'bg-bitbucket',
        'opacity-100',
        'opacity-25',
        '-translate-x-2',
        '-translate-x-4',
        '-translate-x-6',
        '-translate-x-8',
        '-translate-x-10',
        '-translate-x-12'
      ]
    }
  },
  variants: {
    extend: {
      translate: ['group-hover'],
      cursor: ['hover'],
      borderStyle: ['hover', 'focus'],
      animation: ['motion-safe'],
      margin: ['first']
    }
  },
  theme: {
    extend: {
      spacing: {
        19: '4.75rem',
        84: '21rem',
        88: '22rem',
        92: '23rem',
        98: '27rem'
      },
      gridTemplateColumns: {
        support: '5fr 7fr',
        discover: '8fr 4fr',
        sidebar: '268px 1fr',
        'repeat-8': 'repeat(auto-fill, minmax(8rem, 1fr))',
        'repeat-10': 'repeat(auto-fill, minmax(10rem, 1fr))',
        '14-fr': 'minmax(auto, 14rem) 1fr'
      },
      height: {
        'nav-sidebar': 'calc(100vh - 96px)'
      },
      maxWidth: {
        prose: '65ch',
        '3xs': '12rem'
      },
      borderRadius: {
        '3px': '3px'
      },
      boxShadow: {
        blur: '-12px 0px 8px rgba(22, 24, 29, 1);'
      },
      animation: {
        'glow-bg': 'glow 4s ease-out 1ms infinite',
        'pulse-border-once': 'pulse-border-once 1s ease-in forwards',
        'glow-bg-brighter': 'glow-brighter 4s ease-out 1ms infinite'
      },
      keyframes: {
        glow: {
          '0%': {
            filter: 'drop-shadow(0 0 150px rgba(69, 104, 220, 0.15))'
          },

          '40%': {
            filter: 'drop-shadow(0 0 250px rgba(69, 104, 220, 0.15))'
          },

          '50%': {
            filter: 'drop-shadow(0 0 275px rgba(69, 104, 220, 0.15))'
          },

          '80%': {
            filter: 'drop-shadow(0 0 200px rgba(69, 104, 220, 0.15))'
          },

          '100%': {
            filter: 'drop-shadow(0 0 150px rgba(69, 104, 220, 0.15))'
          }
        },
        'pulse-border-once': {
          to: { borderColor: 'transparent' }
        },
        'glow-brighter': {
          '0%': {
            filter: 'drop-shadow(0 0 150px rgba(69, 104, 220, 0.5))'
          },

          '40%': {
            filter: 'drop-shadow(0 0 250px rgba(69, 104, 220, 0.5))'
          },

          '50%': {
            filter: 'drop-shadow(0 0 275px rgba(69, 104, 220, 0.5))'
          },

          '80%': {
            filter: 'drop-shadow(0 0 200px rgba(69, 104, 220, 0.5))'
          },

          '100%': {
            filter: 'drop-shadow(0 0 150px rgba(69, 104, 220, 0.5))'
          }
        }
      },
      zIndex: {
        5: '5'
      }
    }
  }
}
