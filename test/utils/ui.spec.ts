import generateColorFromTag from '~/utils/ui'

describe('[[ Test toTitleCase ]]', () => {
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

    for (let index = 0; index < coreVariants.length; index++) {
      const variant = coreVariants[index]
      const value = generateColorFromTag(variant)
      expect(hexCodePattern.test(value)).toEqual(true)
    }
  })
})
