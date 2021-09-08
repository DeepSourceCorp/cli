import { Maybe } from '~/types/types'

function resize(arr: Array<unknown>, newSize: number): Array<unknown> {
  return [...arr, ...Array(Math.max(newSize - arr.length, 0)).fill(0)].splice(0, newSize)
}

function getLastTwoTrends(trendData?: Record<string, number[]>): number[] {
  if (trendData && Array.isArray(trendData.values)) {
    const length = trendData.values.length
    return [trendData.values[length - 1], trendData.values[length - 2]]
  }
  return [0, 0]
}

function getChangeFromTrend(trendData?: Record<string, number[]>, percentage = true): number {
  const [current, prev] = getLastTwoTrends(trendData)
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

export { resize, getLastTwoTrends, getChangeFromTrend, resolveNodes }
