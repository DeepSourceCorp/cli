import { Component, Vue } from 'nuxt-property-decorator'
import { ZPagination } from '@deepsource/zeal'

@Component({
  components: {
    ZPagination
  }
})
export default class PaginationMixin extends Vue {
  public perPageCount = 5
  public currentPage = 1
  public totalCount = 0

  get queryOffset(): number {
    return (this.currentPage - 1) * this.perPageCount
  }

  get totalPageCount(): number {
    if (this.totalCount) return Math.ceil(this.totalCount / this.perPageCount)
    return 0
  }

  updatePageNum(newPage: number): void {
    this.currentPage = newPage
    this.$fetch()
  }
}
