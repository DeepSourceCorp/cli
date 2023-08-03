<template>
  <z-alert :dismissible="dismissible" type="neutral" @dismiss="$emit('hide-integration-info')">
    <div class="space-y-2">
      <h2 class="text-sm font-medium text-vanilla-100">
        {{ title }}
      </h2>

      <p class="text-xs leading-relaxed text-vanilla-400">
        {{ description }}
      </p>
    </div>
  </z-alert>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'nuxt-property-decorator'

@Component({ name: 'IntegrationInfo' })
export default class IntegrationInfo extends Vue {
  @Prop({ required: true })
  description: boolean

  @Prop({ default: false })
  dismissible: boolean

  @Prop({ default: 'How does it work?' })
  title: boolean
}
</script>
