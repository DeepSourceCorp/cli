const plugin = require('tailwindcss/plugin')
const typographyConfig = require('./utils/tailwind/typography.js')
const colors = require('./utils/tailwind/colors.js')

module.exports = {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './utils/**/*.{js,ts}',
    './App.{js,ts,vue}',
    './app.{js,ts,vue}',
    './Error.{js,ts,vue}',
    './error.{js,ts,vue}',
    'mixins/**/*.{vue,js,ts}',
    'nuxt.config.{js,ts}',
    './app.config.{js,ts}',
    // Report types file has bg color config
    'types/reportTypes.ts'
  ],
  safelist: [
    'is-editor-empty',
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
  ],
  theme: {
    screens: {
      xs: '321px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    colors,
    gradients: (theme) => ({
      ocean: [
        '98.66deg',
        `${theme('colors.sea-glass')} 9.7%`,
        `${theme('colors.aqua.DEFAULT')} 96.6%`
      ],
      galaxy: {
        type: 'radial',
        colors: [
          '60.53% 61.06% at 68.85% 57.59%',
          `${theme('colors.robin.DEFAULT')}75 0%`,
          `${theme('colors.lilac')}29 55.73%`,
          `${theme('colors.vanilla.100')}00 100%`
        ]
      },
      dawn: [
        '98.66deg',
        `${theme('colors.robin.DEFAULT')} 4.42%`,
        `${theme('colors.lilac')} 96.6%`
      ],
      'dark-dawn': {
        custom: `linear-gradient(180deg, ${theme(
          'colors.ink.400'
        )} 0%, rgba(22, 24, 29, 0.7) 100%), 
          linear-gradient(98.66deg, ${theme('colors.robin.DEFAULT')} 4.42%, ${theme(
            'colors.lilac'
          )} 96.6%)`
      },
      splash: ['98.66deg', `${theme('colors.robin.DEFAULT')} 4.42%`, '#3450AF 96.6%'],
      skeleton: [
        '104.58deg',
        `${theme('colors.ink.300')} 0%`,
        `${theme('colors.ink.200')} 40.08%`,
        `${theme('colors.ink.300')} 60.32%`
      ],
      juniper: [
        '0deg',
        `${theme('colors.transparent')} 0%`,
        `${theme('colors.juniper.DEFAULT')} 100%`
      ]
    }),
    borderColor: (theme) => ({
      ...theme('colors'),
      DEFAULT: theme('colors.slate.200', 'currentColor')
    }),
    outline: (theme) => ({
      'slate-400': [`1px solid ${theme('colors.slate.400')}`, '0px']
    }),
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      '3px': '3px',
      md: '0.25rem',
      lg: '0.375rem',
      xl: '0.625rem',
      full: '9999px'
    },
    boxShadow: {
      xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      outline: '0 0 0 3px rgba(66, 153, 225, 0.5)',
      none: 'none',
      white: '0px 0px 2px 0px rgba(255,255,255,1)',
      black: '1px 4px 20px rgba(0, 0, 0, 0.44)',
      grey: '0px 2px 6px rgba(0, 0, 0, 0.3)',
      z1: '2px 2px 6px 0px #050D21 20%',
      z2: '4px 10px 15px 2px #050D21 20%',
      z3: '6px 15px 20px 5px #050D21 30%',
      'inner-z1': '2px 2px 6px 2px #050D21 20% inset',
      'inner-z2': '-1px -1px 12px 0px #9A9A9A 10% inset',
      'double-dark':
        '0px 18px 51px rgba(0, 0, 0, 0.26), 0px 2.25388px 6.38599px rgba(0, 0, 0, 0.13)',
      blur: '-12px 0px 8px rgba(18, 19, 23, 1);',
      'blur-lg': '-12px 0px 24px rgba(18, 19, 23, 1);'
    },
    container: {
      padding: {
        DEFAULT: '0rem',
        sm: '1rem',
        lg: '2rem',
        xl: '4rem',
        '2xl': '5rem'
      }
    },
    fontFamily: {
      sans: [
        'Inter',
        'ui-sans-serif',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"'
      ],
      serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      mono: [
        'ui-monospace',
        'Menlo',
        'Monaco',
        'Consolas',
        '"Liberation Mono"',
        '"Courier New"',
        'monospace'
      ]
    },
    fontSize: {
      xxs: '0.625rem',
      '11px': '11px',
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.25rem',
      xl: '1.375rem',
      '1.5xl': '1.5rem',
      '2xl': '1.75rem',
      '2.5xl': '2rem',
      '3xl': '2.75rem',
      '4xl': '4rem',
      '5xl': ['4.5rem', { lineHeight: '1' }],
      '6xl': ['6rem', { lineHeight: '1' }],
      '7xl': ['8rem', { lineHeight: '1' }]
    },
    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
      3: '.875rem',
      4: '1rem',
      5: '1.125rem',
      6: '1.25rem',
      7: '1.375rem',
      8: '1.5rem',
      9: '1.75rem',
      10: '2rem',
      11: '3.5rem',
      12: '5rem'
    },
    minHeight: (theme) => ({
      0: '0',
      '1/2': '50%',
      full: '100%',
      screen: '100vh',
      ...theme('spacing')
    }),
    minWidth: (theme) => ({
      0: '0',
      '1/2': '50%',
      full: '100%',
      min: 'min-content',
      max: 'max-content',
      ...theme('spacing')
    }),
    strokeWidth: {
      0: '0',
      1: '1',
      1.5: '1.5',
      2: '2',
      2.5: '2.5',
      3: '3'
    },
    ringColor: (theme) => ({
      DEFAULT: theme('colors.blue.500', '#3b82f6'),
      ...theme('colors')
    }),
    transitionProperty: {
      none: 'none',
      all: 'all',
      DEFAULT:
        'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
      colors: 'background-color, border-color, color, fill, stroke',
      opacity: 'opacity',
      shadow: 'box-shadow',
      transform: 'transform',
      'max-height': 'max-height'
    },
    animation: {
      none: 'none',
      fadeIn: 'fadeIn 1s',
      fadeInFast: 'fadeIn 0.5s',
      expand: 'expand 1s',
      spin: 'spin 1s linear infinite',
      'first-half-spin': 'first-half-spin 0.5s',
      'reverse-half-spin': 'reverse-half-spin 0.5s',
      'first-quarter-spin': 'first-quarter-spin 0.5s',
      'reverse-quarter-spin': 'reverse-quarter-spin 0.5s',
      gradient: 'gradient 30s ease infinite',
      ping: 'ping 2.5s linear infinite',
      pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      bounce: 'bounce 1s infinite',
      'slide-left-enter-active': 'slide-left-in 0.5s ease-out',
      'slide-left-leave-active': 'slide-left-out 0.5s ease-out',
      'slide-right-enter-active': 'slide-right-in 0.5s ease-out',
      'slide-right-leave-active': 'slide-right-out 0.5s ease-out',
      'slide-bottom-enter-active': 'slide-bottom-in 0.2s ease-out',
      'slide-bottom-leave-active': 'slide-bottom-out 0.2s ease-out',
      float: 'float 6s ease-in-out infinite',
      'glow-bg': 'glow 4s ease-out 1ms infinite',
      'pulse-border-once': 'pulse-border-once 1s ease-in forwards',
      'glow-bg-brighter': 'glow-brighter 4s ease-out 1ms infinite'
    },
    keyframes: {
      expand: {
        from: {
          height: '0px'
        },
        to: {
          height: 'auto'
        }
      },
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' }
      },
      spin: {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' }
      },
      'first-quarter-spin': {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(90deg)' }
      },
      'reverse-quarter-spin': {
        from: { transform: 'rotate(90deg)' },
        to: { transform: 'rotate(0deg)' }
      },
      gradient: {
        '0%': {
          'background-position': '0% 50%'
        },
        '50%': {
          'background-position': '100% 50%'
        },
        '100%': {
          'background-position': '0% 50%'
        }
      },
      'first-half-spin': {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(180deg)' }
      },
      'reverse-half-spin': {
        from: { transform: 'rotate(180deg)' },
        to: { transform: 'rotate(0deg)' }
      },
      ping: {
        '0%, 100%': { transform: 'scale(1.1)', opacity: '0.4' },
        '50%': { transform: 'scale(1.4)', opacity: '0.5' },
        '75%': { transform: 'scale(1.2)' }
      },
      pulse: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '.5' }
      },
      bounce: {
        '0%, 100%': {
          transform: 'translateY(-25%)',
          animationTimingFunction: 'cubic-bezier(0.8,0,1,1)'
        },
        '50%': {
          transform: 'translateY(0)',
          animationTimingFunction: 'cubic-bezier(0,0,0.2,1)'
        }
      },
      'slide-right-out': {
        from: {
          transform: 'translateX(0%)'
        },
        to: {
          transform: 'translateX(-100%)'
        }
      },
      'slide-right-in': {
        from: {
          transform: 'translateX(100%)'
        },
        to: {
          transform: 'translateX(0%)'
        }
      },
      'slide-left-in': {
        from: {
          transform: 'translateX(-100%)'
        },
        to: {
          transform: 'translateX(0%)'
        }
      },
      'slide-left-out': {
        from: {
          transform: 'translateX(0%)'
        },
        to: {
          transform: 'translateX(100%)'
        }
      },
      'slide-bottom-in': {
        from: {
          transform: 'translateY(100%)'
        },
        to: {
          transform: 'translateY(0%)'
        }
      },
      'slide-bottom-out': {
        from: {
          transform: 'translateY(0%)'
        },
        to: {
          transform: 'translateY(100%)'
        }
      },
      float: {
        '0%': {
          transform: 'translate(0,  0px)'
        },
        '50%': {
          transform: 'translate(0, 30px)'
        },
        '100%': {
          transform: 'translate(0, -0px)'
        }
      },
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
    extend: {
      height: {
        'nav-sidebar': 'calc(100vh - 96px)'
      },
      spacing: {
        4.5: '1.125rem',
        13: '3.25rem',
        15: '3.75rem',
        17: '4.25rem',
        19: '4.75rem',
        22: '5.5rem',
        23: '5.75rem',
        26: '6.5rem',
        84: '21rem',
        88: '22rem',
        92: '23rem',
        98: '27rem',
        102: '32rem',
        '3px': '3px'
      },
      backgroundSize: {
        xl: '400% 100%'
      },
      inset: { 50: '50%' },
      letterSpacing: {
        snug: '-0.008em',
        'widest-lg': '0.15em'
      },
      maxWidth: { '3xs': '12rem', '2xs': '16rem', prose: '65ch' },
      width: {
        100: '30rem',
        120: '42rem',
        halfScreen: '50vw'
      },
      zIndex: {
        5: '5',
        1000: '1000'
      },
      gridTemplateColumns: {
        'fr-fr-8': '1fr 1fr minmax(auto, 8rem)',
        'fr-fr-10': '1fr 1fr minmax(auto, 10rem)',
        'fr-fr-12': '1fr 1fr minmax(auto, 12rem)',
        'fr-fr-16': '1fr 1fr minmax(auto, 16rem)',
        'fr-fr-20': '1fr 1fr minmax(auto, 20rem)',
        'fr-fr-22': '1fr 1fr minmax(auto, 22rem)',
        'fr-fr-24': '1fr 1fr minmax(auto, 24rem)',

        'fr-8': '1fr minmax(auto, 8rem)',
        'fr-10': '1fr minmax(auto, 10rem)',
        'fr-12': '1fr minmax(auto, 12rem)',
        'fr-16': '1fr minmax(auto, 16rem)',
        'fr-20': '1fr minmax(auto, 20rem)',
        'fr-22': '1fr minmax(auto, 22rem)',
        'fr-24': '1fr minmax(auto, 24rem)',

        '8-fr': 'minmax(auto, 8rem) 1fr',
        '12-fr': 'minmax(auto, 12rem) 1fr',
        '14-fr': 'minmax(auto, 14rem) 1fr',
        '16-fr': 'minmax(auto, 16rem) 1fr',
        '20-fr': 'minmax(auto, 20rem) 1fr',
        '22-fr': 'minmax(auto, 22rem) 1fr',
        '24-fr': 'minmax(auto, 24rem) 1fr',

        footer: 'repeat(5, 1fr) 2fr 1.5fr',
        support: '5fr 7fr',
        discover: '8fr 4fr',
        sidebar: '268px 1fr',
        'repeat-8': 'repeat(auto-fill, minmax(8rem, 1fr))',
        'repeat-10': 'repeat(auto-fill, minmax(10rem, 1fr))'
      },
      gridTemplateRows: {
        footer: 'auto 15%'
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.05)'
      },
      transitionDuration: {
        DEFAULT: '150ms'
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            ...typographyConfig.DEFAULT(theme)
          }
        },
        muted: {
          css: {
            ...typographyConfig.MUTED(theme)
          }
        },
        rte: {
          css: {
            ...typographyConfig.RTE(theme)
          }
        },
        sm: {
          css: {
            ...typographyConfig.SMALL_SCREEN_CSS(theme)
          }
        },
        lg: {
          css: {
            ...typographyConfig.LARGE_SCREEN_CSS(theme)
          }
        },
        xl: {
          css: {
            ...typographyConfig.LARGE_SCREEN_CSS(theme)
          }
        },
        '2xl': {
          css: {
            ...typographyConfig.LARGE_SCREEN_CSS(theme)
          }
        },
        'issue-description': {
          css: {
            ...typographyConfig.ISSUE_DESCRIPTION(theme)
          }
        }
      })
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/line-clamp'),
    plugin(function ({ addVariant, e, postcss }) {
      addVariant('no-filter', ({ container, separator }) => {
        const supportsRule = postcss.atRule({
          name: 'supports',
          params: 'not (backdrop-filter: blur(1px))'
        })
        supportsRule.append(container.nodes)
        container.append(supportsRule)
        supportsRule.walkRules((rule) => {
          rule.selector = `.${e(`no-filter${separator}${rule.selector.slice(1)}`)}`
        })
      })
    }),
    plugin(function ({ addVariant }) {
      addVariant('sibling-checked', ({ container }) => {
        container.walkRules((rule) => {
          rule.selector = `:checked ~ .sibling-checked\\:${rule.selector.slice(1)}`
        })
      })
    }),
    plugin(({ addUtilities }) => {
      const contentUtilities = {
        '.content': {
          content: 'attr(data-content)',
          position: 'absolute'
        },
        '.content-before': {
          content: 'attr(data-before)',
          position: 'absolute'
        },
        '.content-after': {
          content: 'attr(data-after)',
          position: 'absolute'
        }
      }
      addUtilities(contentUtilities, ['before', 'after'])
    }),
    plugin(({ addUtilities, e, theme, variants }) => {
      const utilities = Object.keys(theme('gradients')).map((name) => {
        const gradient = theme('gradients')[name]
        let background = ''
        if (Object.prototype.hasOwnProperty.call(gradient, 'custom')) {
          background = gradient.custom
        } else {
          const type = Object.prototype.hasOwnProperty.call(gradient, 'type')
            ? gradient.type
            : 'linear'
          const gradientColors = Object.prototype.hasOwnProperty.call(gradient, 'colors')
            ? gradient.colors
            : gradient
          background = `${type}-gradient(${gradientColors.join(', ')})`
        }

        return {
          [`.bg-gradient-${e(name)}`]: {
            backgroundImage: background
          }
        }
      })

      addUtilities(utilities, variants('gradients', []))
    }),
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        '.filter-grayscale': {
          filter: 'grayscale(1)'
        }
      }

      addUtilities(newUtilities, ['responsive', 'hover'])
    }),
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.hyphens-none': { hyphens: 'none' },
        '.hyphens-manual': { hyphens: 'manual' },
        '.hyphens-auto': { hyphens: 'auto' }
      })
    }),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'lh-crop': (value) => ({
            content: "''",
            display: 'block',
            height: 0,
            width: 0,
            'margin-top': `calc((1 - ${value.replace(/(rem|em)/g, '')}) * 0.5em)`
          })
        },
        { values: theme('lineHeight') }
      )
    })
  ]
}
