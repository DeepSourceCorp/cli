<template>
  <div>
    <nuxt-link
      :to="$generateRoute(['settings', 'integrations', shortcode])"
      class="flex flex-col p-4 text-left rounded-md bg-ink-300 hover:bg-ink-200"
    >
      <div class="space-y-2" :class="{ 'mb-4': showInstallationStatus }">
        <div class="flex gap-x-3">
          <img :src="logo" alt="logo" class="flex-shrink-0 w-5 h-5 mt-0.5" />
          <h2 class="text-base font-medium text-vanilla-100">
            {{ name }}
          </h2>
        </div>
        <p class="mr-3 text-xs leading-6 text-vanilla-400 integration-description">
          {{ getIntegrationDescription(shortcode) }}
        </p>
      </div>

      <div v-if="showInstallationStatus" class="mt-auto">
        <z-tag
          :bg-color="installed ? 'juniper' : 'ink-200'"
          :icon-color="installed ? 'ink-50' : ''"
          :icon-left="installed ? 'check' : ''"
          size="x-small"
          spacing="py-1 px-2"
          text-size="xxs"
          ><span class="font-semibold" :class="[installed ? 'text-ink-50' : 'text-vanilla-400']">
            {{ installed ? 'INSTALLED' : 'NOT INSTALLED' }}
          </span></z-tag
        >
      </div>
    </nuxt-link>
  </div>
</template>

<script lang="ts">
import { ZTag } from '@deepsourcelabs/zeal'
import { Component, mixins, Prop } from 'nuxt-property-decorator'

import IntegrationsListMixin from '~/mixins/integrationsListMixin'

@Component({
  components: {
    ZTag
  }
})

/**
 * Component that is responsible to render `Event alerts` section on Slack integration detailed view
 */
export default class IntegrationCard extends mixins(IntegrationsListMixin) {
  @Prop({ required: true })
  shortcode: string

  @Prop({ required: true })
  logo: string

  @Prop({ required: true })
  name: string

  @Prop({ required: true })
  installed: boolean

  @Prop({ default: false })
  showInstallationStatus: boolean
}
</script>
