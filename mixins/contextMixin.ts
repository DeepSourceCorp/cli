import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { ContextActionTypes, ContextGetterTypes } from '~/store/account/context'

import { Context } from '~/types/types'

const contextStore = namespace('account/context')

@Component
export default class ContextMixin extends Vue {
  @contextStore.State
  context: Context

  @contextStore.Getter(ContextGetterTypes.TO_ONBOARD)
  toOnboard: boolean

  @contextStore.Getter(ContextGetterTypes.INSTALLATION_URL)
  contextInstallationUrl: (provider: string) => string

  @contextStore.Action(ContextActionTypes.FETCH_CONTEXT)
  fetchContext: () => Promise<void>

  async fetch(): Promise<void> {
    await this.fetchContext()
  }
}
