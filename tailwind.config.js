module.exports = {
  presets: [require('@deepsourcelabs/zeal/tailwind.config')],
  plugins: [require('@tailwindcss/line-clamp')],
  variants: {
    extend: {
      translate: ['group-hover']
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
        support: '5fr 7fr'
      },
      colors: {
        //TODO: migrate to zeal when alert component is finalized
        'light-robin': '#bfceff',
        'light-honey': '#fff1c5'
      }
    }
  }
}
