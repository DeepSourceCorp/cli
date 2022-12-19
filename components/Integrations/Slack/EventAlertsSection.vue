<template>
  <div class="grid grid-cols-1 gap-y-4 md:grid-cols-2 md:gap-y-0">
    <div class="space-y-1.5 max-w-2xs">
      <h2 class="text-sm text-vanilla-300">Event alerts</h2>
      <p class="text-xs text-vanilla-400">
        Events for which you receive notification in your Slack channel.
      </p>
    </div>

    <ul class="space-y-6">
      <li v-for="(event, key) in slackEvents" :key="key" class="flex gap-x-2">
        <span class="inline-flex items-center">
          <z-icon icon="check" color="juniper" />
        </span>
        <span class="text-sm">{{ event }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { ZIcon } from '@deepsource/zeal'
import { Component, mixins } from 'nuxt-property-decorator'

import IntegrationsDetailMixin from '~/mixins/integrationsDetailMixin'

@Component({
  components: {
    ZIcon
  }
})

/**
 * Component that is responsible to render `Event alerts` section on Slack integration detailed view
 */
export default class EventAlertsSection extends mixins(IntegrationsDetailMixin) {}
</script>
