import { Trend } from '~/store/owner/detail'
import { Maybe } from '~/types/types'
import { makeSafeNumber } from './string'

function getLastTwoTrends(trendData?: Trend): number[] {
  const values = trendData?.values
  if (values && Array.isArray(values)) {
    const { length } = values
    const lastValue = makeSafeNumber(values[length - 1], 0)
    const secondLastValue = makeSafeNumber(values[length - 2], 0)

    return [lastValue, secondLastValue]
  }
  return [0, 0]
}

function getChangeFromTrend(trendData?: Trend, percentage = true): number {
  const [current, prev] = getLastTwoTrends(trendData)
  if (current === 0 && prev === 0) {
    return 0
  }
  return percentage ? Math.round(((current - prev) / prev) * 100) : current - prev
}

function resolveNodes(
  connection?: { edges: Array<Maybe<{ node?: Maybe<unknown> }>> } | null | undefined
): unknown[] {
  if (!connection || !connection.edges) {
    return []
  }

  return connection.edges
    .map((edge) => {
      return edge?.node ? edge.node : null
    })
    .filter(Boolean)
}

function parseArrayString(candidate?: string | null | undefined): unknown[] {
  if (candidate) {
    try {
      return JSON.parse(candidate)
    } catch {
      return []
    }
  }
  return []
}

/**
 * Method to test equality of two arrays
 * @template T
 * @param {Array<T>} a
 * @param {Array<T>} b
 * @param {boolean} [strict=false] match elements and their positions too, or not
 * @returns {boolean}
 */
function checkArrayEquality<T>(a: Array<T>, b: Array<T>, strict = false): boolean {
  if (strict) {
    return a.length === b.length && a.every((element, index) => element === b[index])
  }

  return a.length === b.length && a.every((element) => b.includes(element))
}

export { getLastTwoTrends, getChangeFromTrend, resolveNodes, parseArrayString, checkArrayEquality }
