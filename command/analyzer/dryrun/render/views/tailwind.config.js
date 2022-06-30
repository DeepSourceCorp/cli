const typographyConfig = require('./typography.js')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["*.{html,js}"],
  theme: {
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
      ],
    },
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000000',
      slate: '#52575c',
      github: '#414141',
      gitlab: '#6753b5',
      bitbucket: '#1e54c5',
      lavender: '#7a97fa',
      lilac: '#c97bd4',
      'sea-glass': '#49f9cf',
      pink: '#f977ff',
      'light-juniper': '#2eb78b', // legacy
      'light-cherry': '#d6435b', // legacy
      juniper: {
        DEFAULT: '#33cb9a',
        600: '#2eb78b',
        500: '#33cb9a',
        400: '#53d4aa',
        300: '#74dcba',
        200: '#94e4ca',
        150: '#a5e8d2',
        100: '#b5ecda'
      },
      robin: {
        DEFAULT: '#4568dc',
        600: '#2449c1',
        500: '#4568dc',
        400: '#6784e2',
        200: '#acbcef',
        300: '#8aa0e9',
        150: '#bdcaf3',
        100: '#ced8f6'
      },
      cherry: {
        DEFAULT: '#da5565',
        600: '#d6435b',
        500: '#da5565',
        400: '#e17783',
        300: '#e998a2',
        200: '#f0bac0',
        150: '#f4cacf',
        100: '#f7dbde'
      },
      honey: {
        DEFAULT: '#f6d87c',
        600: '#f0bf28',
        500: '#f6d87c',
        400: '#f9e3a2',
        300: '#fbefc8',
        200: '#fefaef',
        150: '#ffffff',
        100: '#ffffff'
      },
      aqua: {
        DEFAULT: '#23c4f8',
        600: '#07aade',
        500: '#23c4f8',
        400: '#4bcff9',
        300: '#72d9fb',
        200: '#9ae4fc',
        150: '#ade9fc',
        100: '#c1eefd'
      },
      ink: {
        50: '#303540',
        100: '#2a2e37',
        200: '#23262e',
        300: '#1a1d23',
        400: '#16181d'
      },
      vanilla: {
        100: '#ffffff',
        200: '#f5f5f5',
        300: '#eeeeee',
        400: '#c0c1c3'
      }
    },
    extend: {
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
        }
      })
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}