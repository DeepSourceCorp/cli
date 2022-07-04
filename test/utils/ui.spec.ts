import { generateColorFromTag, getColorShades, newShade } from '~/utils/ui'

describe('[[ Test generateColorFromTag ]]', () => {
  it('Returns valid color for known tags', () => {
    const tags = [
      'django',
      'eslint',
      'flask',
      'javascript',
      'node',
      'react',
      'nextjs',
      'vue',
      'nuxtjs',
      'vite',
      'security',
      'types',
      'typescript'
    ]
    const tagColors = [
      '#092E20',
      '#4B32C3',
      '#52575c',
      '#f7df1e',
      '#66cc33',
      '#61DBFB',
      '#61DBFB',
      '#41B883',
      '#41B883',
      '#646cff',
      '#d6435b',
      '#2449c1',
      '#3178c6'
    ]
    for (let index = 0; index < tags.length; index++) {
      let tag = tags[index]
      let tagColor = tagColors[index]
      expect(generateColorFromTag(tag)).toBe(tagColor)
    }
  })

  it('Runs without failing for regex matches', () => {
    const coreVariants = [
      'cwe',
      'owasp',
      'react',
      'hello-world',
      'this-is-an-absurdly-long-tag-god-help-if-you-use-it'
    ]

    const hexCodePattern = new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')

    // Thou shall loop over arrays only with for-loops ~ Vaibhav, 2022
    for (let index = 0; index < coreVariants.length; index++) {
      const variant = coreVariants[index]
      const value = generateColorFromTag(variant)
      expect(hexCodePattern.test(value)).toEqual(true)
    }
  })
})

describe('[[ Test getColorShades ]]', () => {
  it('It generates valid colors', () => {
    const zealPalette = [
      '#52575c',
      '#414141',
      '#6753b5',
      '#1e54c5',
      '#7a97fa',
      '#c97bd4',
      '#49f9cf',
      '#f977ff',
      '#2eb78b',
      '#d6435b',
      '#33cb9a',
      '#4568dc',
      '#da5565',
      '#f6d87c',
      '#23c4f8',
      '#2449c1',
      '#07aade'
    ]
    const hexCodePattern = new RegExp('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')

    zealPalette.forEach((zealColor) => {
      getColorShades(zealColor, 15).forEach((hex) => {
        expect(hexCodePattern.test(hex)).toBeTruthy()
      })
    })
  })

  it('newShade handles wrong input', () => {
    expect(newShade('hello-world', 4)).toEqual('hello-world')
  })
})
