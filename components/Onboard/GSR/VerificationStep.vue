<template>
  <section class="min-h-56 space-y-4">
    <div class="flex items-center justify-between space-x-2">
      <h2
        class="flex-grow text-base font-semibold leading-none text-vanilla-300"
        :class="[isComplete ? 'line-through' : '']"
      >
        {{ title }}
      </h2>
      <z-tag bg-color="ink-200" text-size="xs" spacing="py-0.5 px-2">
        {{ sequence }} / {{ total }}
      </z-tag>
    </div>
    <div class="space-y-2 text-sm">
      <slot></slot>
    </div>
  </section>
</template>
<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component({
  meta: {
    auth: {
      strict: true,
      redirectToLogin: true
    }
  }
})
export default class GSRVerificationStep extends Vue {
  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  sequence: number

  @Prop({ required: true })
  total: number

  @Prop({ default: false })
  isOpen: boolean

  @Prop({ default: false })
  isComplete: boolean
}
</script>
