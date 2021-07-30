import { Component, Vue } from 'nuxt-property-decorator'

@Component
export default class RouteParamsMixin extends Vue {
  public repo: string
  public owner: string
  public provider: string

  created(): void {
    const { repo, owner, provider } = this.$route.params
    this.repo = repo
    this.owner = owner
    this.provider = provider
  }
}
