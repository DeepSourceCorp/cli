import { CheckStatus, RunStatus } from '~/types/types'

const knownTagPatterns: Record<string, string> = {
  '^cwe': '#005980',
  '^owasp': '#ea580c',
  '^sans': '#005980',
  '^a[0-1][0-9]': '#ea580c'
}

const teamAvatars = [
  require('~/assets/images/default-avatars/team/team-1.webp'),
  require('~/assets/images/default-avatars/team/team-2.webp'),
  require('~/assets/images/default-avatars/team/team-3.webp'),
  require('~/assets/images/default-avatars/team/team-4.webp'),
  require('~/assets/images/default-avatars/team/team-5.webp'),
  require('~/assets/images/default-avatars/team/team-6.webp'),
  require('~/assets/images/default-avatars/team/team-7.webp'),
  require('~/assets/images/default-avatars/team/team-8.webp'),
  require('~/assets/images/default-avatars/team/team-9.webp')
]

const personAvatars = [
  require('~/assets/images/default-avatars/person/person-1.webp'),
  require('~/assets/images/default-avatars/person/person-2.webp'),
  require('~/assets/images/default-avatars/person/person-3.webp'),
  require('~/assets/images/default-avatars/person/person-4.webp'),
  require('~/assets/images/default-avatars/person/person-5.webp'),
  require('~/assets/images/default-avatars/person/person-6.webp'),
  require('~/assets/images/default-avatars/person/person-7.webp'),
  require('~/assets/images/default-avatars/person/person-8.webp'),
  require('~/assets/images/default-avatars/person/person-9.webp')
]

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

/**
 * Get icon for a given check status.
 *
 * @param {CheckStatus} status Status code of the check
 * @returns {string} icon to be used to represent the check status
 */
export function checkStatusIcon(status: CheckStatus): string {
  const types: Record<CheckStatus, string> = {
    [CheckStatus.Pass]: 'check',
    [CheckStatus.Fail]: 'x',
    [CheckStatus.Pend]: 'spin-loader',
    [CheckStatus.Timo]: 'timer-reset',
    [CheckStatus.Cncl]: 'alert-circle',
    [CheckStatus.Read]: 'circle-dot',
    [CheckStatus.Neut]: 'circle-dot',
    [CheckStatus.Atmo]: 'run-failed',
    [CheckStatus.Wait]: 'alarm-clock'
  }
  return types[status] ?? types[CheckStatus.Pass]
}

/**
 * Get icon color for a given check status.
 *
 * @param {CheckStatus} status Status code of the check
 * @returns {string} icon color to be used to represent the check status
 */
export function checkStatusIconColor(status: CheckStatus): string {
  const types: Record<CheckStatus, string> = {
    [CheckStatus.Pass]: 'juniper',
    [CheckStatus.Fail]: 'cherry',
    [CheckStatus.Pend]: 'vanilla-400',
    [CheckStatus.Timo]: 'honey',
    [CheckStatus.Cncl]: 'honey',
    [CheckStatus.Read]: 'vanilla-400',
    [CheckStatus.Neut]: 'vanilla-400',
    [CheckStatus.Atmo]: 'vanilla-400',
    [CheckStatus.Wait]: 'vanilla-400'
  }
  return types[status] ?? types[CheckStatus.Pass]
}

/**
 * Get tag label for a given check status.
 *
 * @param {CheckStatus} status Status code of the check
 * @returns {string} label for the tag
 */
export function checkStatusTagLabel(status: CheckStatus): string {
  const types: Record<CheckStatus, string> = {
    [CheckStatus.Pass]: 'Passed',
    [CheckStatus.Fail]: 'Failing',
    [CheckStatus.Pend]: 'Running',
    [CheckStatus.Timo]: 'Timed out',
    [CheckStatus.Cncl]: 'Cancelled',
    [CheckStatus.Read]: 'Ready',
    [CheckStatus.Wait]: 'Waiting',
    [CheckStatus.Atmo]: 'Timed out',
    [CheckStatus.Neut]: 'Ready'
  }
  return types[status] ?? types[CheckStatus.Pass]
}

/**
 * Get icon for a given run status.
 *
 * @param {RunStatus} status Status code of the run
 * @returns {string} icon to be used to represent the run status
 */
export function runStatusIcon(status: RunStatus): string {
  const types: Record<RunStatus, string> = {
    [RunStatus.Pass]: 'check',
    [RunStatus.Fail]: 'x',
    [RunStatus.Pend]: 'spin-loader',
    [RunStatus.Timo]: 'timer',
    [RunStatus.Cncl]: 'alert-circle',
    [RunStatus.Read]: 'circle-dot'
  }
  return types[status] ?? types[RunStatus.Pass]
}

/**
 * Get icon color for a given run status.
 *
 * @param {RunStatus} status Status code of the run
 * @returns {string} icon color to be used to represent the run status
 */
export function runStatusIconColor(status: RunStatus): string {
  const types: Record<RunStatus, string> = {
    [RunStatus.Pass]: 'juniper',
    [RunStatus.Fail]: 'cherry',
    [RunStatus.Pend]: 'vanilla-100',
    [RunStatus.Timo]: 'honey',
    [RunStatus.Cncl]: 'honey',
    [RunStatus.Read]: 'vanilla-400'
  }
  return types[status] ?? types[RunStatus.Pass]
}

/**
 * Get tag label for a given run status.
 *
 * @param {RunStatus} status Status code of the run
 * @returns {string} label for the tag
 */
export function runStatusTagLabel(status: RunStatus, forSentence = false): string {
  const types: Record<RunStatus, string> = {
    [RunStatus.Pass]: 'Passed',
    [RunStatus.Fail]: 'Failing',
    [RunStatus.Pend]: 'Running',
    [RunStatus.Timo]: 'Timed out',
    [RunStatus.Cncl]: 'Cancelled',
    [RunStatus.Read]: 'Ready'
  }

  const sentenceTypes: Record<RunStatus, string> = {
    [RunStatus.Pass]: 'Passed in',
    [RunStatus.Fail]: 'Failed after',
    [RunStatus.Pend]: 'Analysis in progress',
    [RunStatus.Timo]: 'Timed out after',
    [RunStatus.Cncl]: 'Cancelled after',
    [RunStatus.Read]: 'Completed in'
  }

  if (forSentence) {
    return sentenceTypes[status] ?? sentenceTypes[RunStatus.Pass]
  }

  return types[status] ?? types[RunStatus.Pass]
}

/**
 * Return default avatar from the ones available in assets
 *
 * @param {string} name - the key to select avatar from
 * @param {boolean} [forIndividual=true]
 * @returns {NodeRequire}
 */
export function getDefaultAvatar(name: string, forIndividual = true): NodeRequire {
  const imagesSrcArray = forIndividual ? personAvatars : teamAvatars
  if (typeof name === 'string') return imagesSrcArray[name.length % imagesSrcArray.length]

  return imagesSrcArray[0]
}
