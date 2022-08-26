import { Component, Vue } from 'nuxt-property-decorator'
import { Location } from 'vue-router'

export type RouteParamValueT = string | number | boolean | undefined | null
export type RouteQueryParamsT = Record<string, RouteParamValueT>

/**
 * Unmarshall a string into a number or boolean based on certain heuristics
 *
 * @param {string} value
 *
 * @return {string | number | boolean}
 */
function unmarshall(value: string): string | number | boolean {
  if (Number.isFinite(Number(value))) {
    return Number(value)
  }
  if (value === 'false') return false
  if (value === 'true') return true

  return value
}

@Component
export default class RouteQueryMixin extends Vue {
  public get queryParams(): RouteQueryParamsT {
    const { query } = this.$route
    const parsedQuery: RouteQueryParamsT = {}

    // Why Object.keys ?
    // Looping over objects with a for in loop will include
    // properties that are inherited through the prototype chain.
    for (const key of Object.keys(query)) {
      parsedQuery[key] = unmarshall(String(query[key]))
    }

    return parsedQuery
  }

  public set queryParams(params: RouteQueryParamsT) {
    if (process.server) {
      return
    }

    // remove nullish values
    Object.keys(params).forEach(
      // cast this as an array of unknowns, becuase this is a well
      // defined array and we cannot search a string in it
      (k) => ([null, undefined, ''] as unknown[]).includes(params[k]) && delete params[k]
    )

    this.setRouteQueryParams(params as Location['query'])
  }

  /**
   * Replace the query and trigger a fetch after the route replace has finished
   *
   * @param {Location['query']} query
   *
   * @return {void}
   */
  private async setRouteQueryParams(query: Location['query']) {
    await this.$router.replace({ query })
    await this.refetchAfterRouteChange()
  }

  /**
   * Callback for route replace
   *
   * @return {void}
   */
  async refetchAfterRouteChange(): Promise<void> {
    await this.$fetch()
  }

  /**
   * Add an object to the route query
   *
   * @param {Record<string, string|number|null>} newParams
   *
   * @return {void}
   */
  addFilters(newParams: Record<string, string | number | null>): void {
    this.queryParams = Object.assign(this.queryParams, newParams)
  }

  /**
   * Remove a filter and re-assign it to query params
   *
   * @param {string} key
   *
   * @return {void}
   */
  removeFilter(key: string): void {
    delete this.queryParams[key]

    //? Reassigning triggers the computed methods
    this.queryParams = Object.assign({}, this.queryParams)
  }
}
