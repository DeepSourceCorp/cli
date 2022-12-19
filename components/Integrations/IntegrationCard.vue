<template>
  <nuxt-link
    :to="$generateRoute(['settings', 'integrations', shortcode])"
    class="flex flex-col p-4 text-left rounded-md bg-ink-300 hover:bg-ink-200 group"
  >
    <div class="space-y-2" :class="{ 'mb-3': showInstallationStatus }">
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
        :bg-color="installed ? 'juniper' : 'ink-200 group-hover:bg-ink-100'"
        spacing="py-1 px-2"
        size="x-small"
        text-size="xxs"
      >
        <div class="flex items-center space-x-1.5">
          <z-icon v-if="installed" icon="check" color="ink-50" size="x-small" class="stroke-3" />
          <z-icon v-else icon="circle-dashed" color="vanilla-400" size="x-small" />
          <span
            class="font-semibold leading-none tracking-wide"
            :class="[installed ? 'text-ink-50' : 'text-vanilla-400']"
          >
            {{ installed ? 'INSTALLED' : 'NOT INSTALLED' }}
          </span>
        </div>
      </z-tag>
    </div>
  </nuxt-link>
</template>

<script lang="ts">
import { ZTag, ZIcon } from '@deepsource/zeal'
import { Component, mixins, Prop } from 'nuxt-property-decorator'

import IntegrationsListMixin from '~/mixins/integrationsListMixin'

@Component({
  components: {
    ZTag,
    ZIcon
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
