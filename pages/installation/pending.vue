<template>
  <div class="h-full p-4 bg-ink-400">
    <empty-state
      :svg-image-path="require('~/assets/images/ui-states/repo/inactive.svg')"
      title="You have not activated a repository yet"
      subtitle="Click the button below to get started."
      class="flex flex-col justify-center min-h-full border-2 border-dashed rounded-lg border-ink-200"
    >
      <template #action>
        <z-button
          v-if="installationUrl.startsWith('http')"
          :to="installationUrl"
          size="small"
          icon="plus"
          label="Activate new repository"
        />
        <nuxt-link-button v-else :to="installationUrl">
          <z-icon icon="plus" size="small" color="ink-400" class="w-4 h-4 flex-shrink-0" />
          <span class="text-sm font-medium">Activate new repository</span>
        </nuxt-link-button>
      </template>
    </empty-state>
  </div>
</template>

<script lang="ts">
import { Component, mixins } from 'nuxt-property-decorator'
import { ZIcon, ZButton } from '@deepsource/zeal'
import { Context } from '@nuxt/types'
import { ContextGetterTypes } from '~/store/account/context'
import ContextMixin from '~/mixins/contextMixin'
import ActiveUserMixin from '~/mixins/activeUserMixin'

/**
 * Page indicating pending installation for a user.
 */
@Component({
  layout: 'sidebar-only',
  components: { ZIcon, ZButton },
  middleware: [
    function ({ redirect, store }: Context): void {
      if (!store.getters[`account/context/${ContextGetterTypes.TO_ONBOARD}`]) {
        redirect('/me')
      }
    }
  ]
})
export default class PendingPage extends mixins(ContextMixin, ActiveUserMixin) {
  get installationUrl(): string {
    if (this.viewer.connectedVcsProviders?.length && this.viewer.connectedVcsProviders.length > 1) {
      return '/installation/providers'
    }
    const provider = this.viewer.connectedVcsProviders?.[0]
    return provider
      ? this.installationUrls[this.$providerMetaMap[provider].auth]
      : '/installation/providers'
  }
}
</script>
