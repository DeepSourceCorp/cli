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

export const zealPalette = [
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
export function generateColorFromTag(tagName: string): string {
  if (knownTags[tagName]) return knownTags[tagName]

  const matchedTag = Object.keys(knownTagPatterns).find((pattern) =>
    new RegExp(pattern, 'i').test(tagName)
  )

  if (matchedTag) {
    return knownTagPatterns[matchedTag]
  }

  return zealPalette[tagName.length % zealPalette.length]
}

/**
 * Generate shade of a give color
 *
 * @param {string} hexColor - color to generate shades for
 * @param {number} magnitude - amount to change the color
 *
 * @return {string}
 */
export function newShade(hexColor: string, magnitude: number): string {
  hexColor = hexColor.replace(`#`, ``)
  if (hexColor.length === 6) {
    const decimalColor = parseInt(hexColor, 16)
    let red = (decimalColor >> 16) + magnitude
    red > 255 && (red = 255)
    red < 0 && (red = 0)

    let green = (decimalColor & 0x0000ff) + magnitude
    green > 255 && (green = 255)
    green < 0 && (green = 0)

    let blue = ((decimalColor >> 8) & 0x00ff) + magnitude
    blue > 255 && (blue = 255)
    blue < 0 && (blue = 0)

    const color = `#${(green | (blue << 8) | (red << 16)).toString(16)}`

    if (color.length < 7) {
      return `${color}${new Array(7 - color.length).fill(0).join()}`
    }
    return color
  } else {
    return hexColor
  }
}

/**
 * Generate n shades of a given color
 *
 * @param {string} baseColor - base color to generate shades for
 * @param {number} numberOfShades - number of shades to generate
 *
 * @return {string[]}
 */
export function getColorShades(baseColor: string, numberOfShades: number): string[] {
  const stepFactor = Math.floor(140 / numberOfShades)
  return Array.from(Array(numberOfShades).keys()).map((step) =>
    newShade(baseColor, step * stepFactor)
  )
}
