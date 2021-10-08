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

function toBool(item: unknown): boolean {
  switch (typeof item) {
    case 'boolean':
      return item
    case 'function':
      return true
    case 'number':
      return item > 0 || item < 0
    case 'object':
      return !!item
    case 'string':
      item = item.toLowerCase()
      return ['true', '1'].includes(item as string)
    case 'symbol':
      return true
    case 'undefined':
      return false

    default:
      throw new TypeError('Unrecognised type: unable to convert to boolean')
  }
}

export {
  toTitleCase,
  toSentenceCase,
  shortenLargeNumber,
  formatUSD,
  formatIntl,
  makeSafeNumber,
  toBool
}
