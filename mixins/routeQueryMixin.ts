import { Component, Vue, Watch } from 'nuxt-property-decorator'
import { Location } from 'vue-router'

@Component
export default class RouteQueryMixin extends Vue {
  public queryParams: Record<string, unknown> = {}

  // created(): void {
  //   this.queryParams = Object.assign(this.queryParams, this.$route.query)
  // }

  addFilter(key: string, value: string | number | null): void {
    if (value) {
      this.queryParams[key] = value
      this.replaceRoute()
    }
  }

  addFilters(newParams: Record<string, string | number | null>): void {
    this.queryParams = Object.assign(this.queryParams, newParams)
    this.replaceRoute()
  }

  removeFilter(key: string): void {
    delete this.queryParams[key]
    this.replaceRoute()
  }

  removeFilters(keys: string[]): void {
    keys.forEach((key) => {
      delete this.queryParams[key]
    })
    this.replaceRoute()
  }

  emptyFilters(): void {
    this.queryParams = {}
    this.replaceRoute()
  }

  replaceFilters(newQueryParams: Record<string, string | number>): void {
    this.queryParams = newQueryParams
    this.replaceRoute()
  }

  // Callback for route replace
  refetchAfterRouteChange(): void {
    this.$fetch()
  }

  @Watch('queryParams', { deep: true, immediate: false })
  replaceRoute(): void {
    // don't run on server
    if (process.server) {
      return
    }

    // remove nullish values
    Object.keys(this.queryParams).forEach(
      (k) => this.queryParams[k] === null && delete this.queryParams[k]
    )

    this.$nextTick(async () => {
      await this.$nuxt.$router.replace({ query: { ...this.queryParams } as Location['query'] })
      this.refetchAfterRouteChange()
    })
  }
}
