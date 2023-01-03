module.exports = {
  presets: [require('@deepsource/zeal/tailwind.config')],
  plugins: [require('@tailwindcss/line-clamp')],
  purge: {
    content: [
      './node_modules/@deepsource/**/*.vue',
      `components/**/*.{vue,js}`,
      `mixins/**/*.{vue,js,ts}`,
      `layouts/**/*.vue`,
      `pages/**/*.vue`,
      `plugins/**/*.{js,ts}`,
      `nuxt.config.{js,ts}`,
      // Report types file has bg color config
      'types/reportTypes.ts'
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
      colors: {
        ink: {
          50: '#303540',
          100: '#2a2e37',
          200: '#23262e',
          300: '#16181d',
          400: '#121317'
        },
        slate: {
          DEFAULT: '#52575c',
          200: '#52575c',
          300: '#24272b',
          400: '#1d2023'
        }
      },
      borderColor: (theme) => ({
        ...theme('colors'),
        DEFAULT: theme('colors.slate.200', 'currentColor')
      }),
      outline: (theme) => ({
        'slate-400': [`1px solid ${theme('colors.slate.400')}`, '0px']
      }),
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
        blur: '-12px 0px 8px rgba(18, 19, 23, 1);'
      },
      // borderColor: {
      //   DEFAULT: '#52575c'
      // },
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
      },
      fontSize: {
        '11px': '11px'
      }
    }
  }
}
