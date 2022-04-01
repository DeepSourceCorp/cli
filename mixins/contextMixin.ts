import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { ContextActionTypes, ContextGetterTypes } from '~/store/account/context'

import { Context, VcsProviderChoices } from '~/types/types'

const contextStore = namespace('account/context')

/**
 * Mixin that provides access to common data and functions for context.
 */
@Component
export default class ContextMixin extends Vue {
  @contextStore.State
  context: Context

  @contextStore.Getter(ContextGetterTypes.TO_ONBOARD)
  toOnboard: boolean

  @contextStore.Getter(ContextGetterTypes.INSTALLATION_URL)
  contextInstallationUrl: (provider: string) => string

  @contextStore.Action(ContextActionTypes.FETCH_CONTEXT)
  fetchContext: (args?: { refetch: boolean }) => Promise<void>

  /**
   * Default fetch hook for pages/components using context mixin.
   *
   * @returns {Promise<void>}
   */
  async fetch(): Promise<void> {
    await this.fetchContext()
  }

  /**
   * @returns {Record<string, string>} Returns record of providers <-> installation urls.
   * Keys should match with `provider` values in `meta` in `nuxt.config.js`.
   */
  get installationUrls(): Record<string, string> {
    const { bitbucket, ...remainderUrls } = this.context.installationUrls
    return {
      ...remainderUrls,
      [this.$providerMetaMap[VcsProviderChoices.Bitbucket].auth]: bitbucket,
      [this.$providerMetaMap[VcsProviderChoices.Gitlab].auth]: '/accounts/gitlab/login',
      [this.$providerMetaMap[VcsProviderChoices.Gsr].auth]: '/accounts/gsr/projects'
    }
  }
}
