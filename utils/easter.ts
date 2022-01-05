/**
 * Function that returns true when it's the christmas season
 * @return {boolean}
 */
function isChristmasSeason(): boolean {
  const today = new Date()
  return today.getMonth() === 11 && today.getDate() >= 20
}

/**
 * Function that returns true when it's halloween
 * @return {boolean}
 */
function isHalloween(): boolean {
  const today = new Date()
  return today.getMonth() === 9 && today.getDate() === 31
}

export { isChristmasSeason, isHalloween }
