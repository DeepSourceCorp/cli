/**
 * Ceils a number to a specified significant number. Returns `0` if provided value is `NaN` or `0`.
 *
 * @param value number to ceil
 * @param significantNumber position of the most significant digit to round to
 * @returns {number} rounded number to given significant digit
 */
export const roundToSignificantNumber = (value: number, significantNumber: number): number => {
  if (Number.isNaN(value) || value === 0) {
    return 0
  }

  const digits = Math.ceil(Math.log10(value < 0 ? -value : value))
  const power = significantNumber - digits

  const magnitude = Math.pow(10, power)
  const shifted = Math.round(magnitude * value)
  return shifted / magnitude
}
