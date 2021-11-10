function toTitleCase(candidate: string): string {
  return candidate
    .replace('-', ' ')
    .replace('_', ' ')
    .replace(/\w\S*/g, (txt) => {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
}

function toSentenceCase(candidate: string): string {
  const sentence = candidate.replace('-', ' ').replace('_', ' ').toLowerCase()
  return sentence.charAt(0).toUpperCase() + sentence.substr(1)
}

const formatter = new Intl.NumberFormat()

function formatIntl(val: number): string {
  return formatter.format(val)
}

function shortenLargeNumber(candidate: number | string): string {
  let number = 0
  if (typeof candidate === 'number') number = candidate
  else if (typeof candidate === 'string') {
    number = Number(candidate)
  }

  if (Number.isNaN(number)) return '0'

  // Using absolute since log wont work for negative numbers
  let p = Math.floor(Math.log10(Math.abs(number)))
  if (p <= 2) return String(number) // Return as is for a 3 digit number of less
  let l = Math.floor(p / 3)
  let shortened = Math.pow(10, p - l * 3) * +(number / Math.pow(10, p)).toFixed(1)

  // Correct for floating point error upto 2 decimal places
  return Math.round(shortened * 100) / 100 + ['', 'k', 'm', 'b', 't'][l]
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

function formatUSD(amount: number): string {
  return usdFormatter.format(amount)
}

function makeSafeNumber(candidate: string, defaultReturnValue = 0): number {
  return isFinite(Number(candidate)) ? Number(candidate) : defaultReturnValue
}

function toWrappableString(
  path: string,
  ...options: [maxLength?: number, separater?: string]
): string {
  const [maxLength = 50, separator = '/'] = options
  const pathTokens = path.split(separator)
  if (pathTokens.length > 2 && path.length > maxLength) {
    const filename = pathTokens.pop()
    const rootFolder = pathTokens.shift()
    if (filename && rootFolder) {
      const reducer = (previousVal: string, currentVal: string): string =>
        `${previousVal}<span>/${currentVal}</span>`
      const folderPath = pathTokens.reduce(reducer, rootFolder)
      return `${folderPath}<span>/${filename}</span>`
    }
  }
  return path
}

function stripTrailingSlash(path: string): string {
  return path.replace(/\/$/, '')
}

export {
  toTitleCase,
  toSentenceCase,
  shortenLargeNumber,
  formatUSD,
  formatIntl,
  makeSafeNumber,
  toWrappableString,
  stripTrailingSlash
}
