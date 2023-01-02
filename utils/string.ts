// Regex to match text enclosed in single or triple backticks in matching pairs
// https://regex101.com/r/5Nc30z/2
// const backTickPattern = new RegExp(/(?<=[^`]|^)(`(?:``)?)([^`]+)\1(?=[^`]|$)/g)

// https://regex101.com/r/0o6P5y/1
const backTickPattern = new RegExp(/(`(?:``)?)([^`]+)\1/g)

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

function toTitleCase(candidate: string): string {
  if (!candidate) return ''
  return candidate
    .replace(/[-, _]/g, ' ')
    .toLowerCase()
    .replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    })
}

function toSentenceCase(candidate: string, removeWhitespace = true): string {
  if (!candidate) return ''

  const sentence = removeWhitespace ? candidate.replace(/[-, _]/g, ' ').toLowerCase() : candidate
  return sentence.charAt(0).toUpperCase() + sentence.substring(1).toLowerCase()
}

const formatter = new Intl.NumberFormat()

function formatIntl(val: number): string {
  return isFinite(val) ? formatter.format(val) : ''
}

function shortenLargeNumber(candidate: number | string): string {
  let number = 0

  if (typeof candidate === 'number') {
    number = candidate
  } else if (typeof candidate === 'string') {
    // Return early if the candidate includes a '%' character.
    if (candidate.includes('%')) {
      return candidate
    }
    number = Number(candidate)
  }

  if (Number.isNaN(number)) return '0'

  // Using absolute since log wont work for negative numbers
  const numberOfDigits = Math.floor(Math.log10(Math.abs(number)))
  if (numberOfDigits <= 2) return String(number) // Return as is for a 3 digit number of less
  const unit = Math.floor(numberOfDigits / 3)
  const shortened =
    Math.pow(10, numberOfDigits - unit * 3) * +(number / Math.pow(10, numberOfDigits)).toFixed(1)

  // Correct for floating point error upto 2 decimal places
  // skipcq: JS-0377
  return Math.round(shortened * 100) / 100 + ['', 'k', 'm', 'b', 't'][unit]
}

function formatUSD(amount: number): string {
  return isFinite(amount) ? usdFormatter.format(amount) : ''
}

function makeSafeNumber(candidate: string | number, defaultReturnValue = 0): number {
  return isFinite(Number(candidate)) ? Number(candidate) : defaultReturnValue
}

/**
 * A lightweight utility to escape strings
 * It is meant to be used for overcoming rendering issues
 * but not for security.
 *
 * @param  {string} unsafeCandidate
 * @returns string
 */
function escapeHtml(unsafeCandidate: string): string {
  return unsafeCandidate
    ? unsafeCandidate
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    : ''
}

function toWrappableString(
  path: string,
  ...options: [maxLength?: number, separater?: string]
): string {
  const escapedPath = escapeHtml(path)

  const [maxLength = 50, separator = '/'] = options
  const pathTokens = escapedPath.split(separator)
  if (pathTokens.length > 2 && escapedPath.length > maxLength) {
    const filename = pathTokens.pop()
    const rootFolder = pathTokens.shift()
    if (filename && rootFolder) {
      const reducer = (previousVal: string, currentVal: string): string =>
        `${previousVal}<span>/${currentVal}</span>`
      const folderPath = pathTokens.reduce(reducer, rootFolder)
      return `${folderPath}<span>/${filename}</span>`
    }
  }
  return escapedPath
}

/**
 * Utility to render backtick as <code>
 *
 * @param  {string} unsafeCandidate - string to transform
 * @returns string
 */
function safeRenderBackticks(unsafeCandidate: string) {
  const safeCandidate = escapeHtml(unsafeCandidate)

  return safeCandidate.replace(backTickPattern, (match) => {
    return `<code class="bifrost-inline-code">${match.replace(/`/g, '')}</code>`
  })
}

/**
 * Utility to remove extra trailing slashes in URLs
 *
 * @param  {string} path
 * @returns string
 */
function stripTrailingSlash(path: string): string {
  return path.replace(/\/$/, '')
}

/**
 * Utility to append apostrophe s depending on last
 * character of the string
 *
 * @param {string} candidate
 * @returns string
 */
function smartApostrophe(candidate: string): string {
  const lastCharacter = candidate[candidate.length - 1]

  return lastCharacter === 's' ? `${candidate}’` : `${candidate}’s`
}

export {
  toTitleCase,
  toSentenceCase,
  shortenLargeNumber,
  formatUSD,
  formatIntl,
  makeSafeNumber,
  toWrappableString,
  stripTrailingSlash,
  escapeHtml,
  safeRenderBackticks,
  smartApostrophe
}
