<template>
  <div class="flex justify-center pt-26 animate-glow-bg">
    <div class="max-w-xl pt-6 pb-4 space-y-6 border rounded-md bg-ink-400 border-ink-200">
      <div class="flex items-center justify-center gap-x-2">
        <div class="p-1.5 pr-1 rounded-sm bg-ink-300">
          <img
            src="~/assets/images/deepsource-logo-centered.svg"
            alt="DeepSource"
            class="flex-shrink-0 w-8 h-8"
          />
        </div>
        <z-icon icon="arrow-left-right" />
        <logo-container :logo="integrationLogo" dimensions="w-8 h-8" />
      </div>

      <div v-if="installingOn || $slots.notice" class="flex justify-center">
        <slot name="notice">
          <notice class="h-8 gap-x-3">
            <template #indicator>
              <span class="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-honey"></span>
            </template>
            <p class="text-xs">
              Installing on
              <span class="font-medium text-vanilla-100">{{ installingOn }}</span>
            </p>
          </notice>
        </slot>
      </div>

      <div class="px-6">
        <slot></slot>
      </div>

      <z-divider />

      <div class="grid px-6 pb-px">
        <z-button
          :is-loading="isInstalling"
          :disabled="primaryDisabled"
          label="Install integration"
          loading-label="Installing integration"
          icon="play-circle"
          size="small"
          class="mb-2.5 place-self-end w-44"
          @click="$emit('triggerInstall')"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ZButton, ZDivider, ZIcon, ZSelect, ZOption } from '@deepsourcelabs/zeal'
import { Component, Vue, Prop } from 'nuxt-property-decorator'

/**
 * Intermediary page where the integration installation happens
 */
@Component({
  components: {
    ZButton,
    ZDivider,
    ZIcon,
    ZSelect,
    ZOption
  }
})
export default class IntegrationCallbackWrapper extends Vue {
  @Prop({ required: true })
  integrationLogo: string

  @Prop({ required: false, default: '' })
  installingOn: string

  @Prop({ required: true })
  isInstalling: boolean

  @Prop({ required: true })
  primaryDisabled: boolean
}
</script>
