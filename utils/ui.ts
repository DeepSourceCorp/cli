const knownTagPatterns: Record<string, string> = {
  '^cwe': '#005980',
  '^owasp': '#ea580c',
  '^sans': '#005980',
  '^a[0-1][0-9]': '#ea580c'
}

const knownTags: Record<string, string> = {
  django: '#092E20',
  eslint: '#4B32C3',
  flask: '#52575c',
  javascript: '#f7df1e',
  node: '#66cc33',
  react: '#61DBFB',
  nextjs: '#61DBFB',
  vue: '#41B883',
  nuxtjs: '#41B883',
  vite: '#646cff',
  security: '#d6435b',
  types: '#2449c1',
  typescript: '#3178c6'
}

const localPalette = [
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

/**
 * Return brand tag color, if exists, else picks color from internal color pallete
 *
 * @param tagName string
 * @returns string
 */
export default function generateColorFromTag(tagName: string): string {
  if (knownTags[tagName]) return knownTags[tagName]

  const matchedTag = Object.keys(knownTagPatterns).find((pattern) =>
    new RegExp(pattern, 'i').test(tagName)
  )

  if (matchedTag) {
    return knownTagPatterns[matchedTag]
  }

  return localPalette[tagName.length % localPalette.length]
}
