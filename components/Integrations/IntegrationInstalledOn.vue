<template>
  <notice class="h-8">
    <p class="text-xs truncate">
      Installed <template v-if="installedOn">on</template>
      <span v-if="installedOn" class="font-medium text-vanilla-100">{{ installedOn }}</span>
    </p>
  </notice>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

/**
 * Component that is responsible to render the integration logo and name on detailed view
 */
@Component({})
export default class IntegrationInstalledOn extends Vue {
  @Prop({ required: true })
  installedOn: string
}
</script>
