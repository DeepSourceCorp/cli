<template>
  <div class="mb-4">
    <div
      v-if="title"
      class="ml-0.5 px-3.5 py-2 font-semibold tracking-wider uppercase text-xxs text-vanilla-400"
    >
      {{ title }}
    </div>
    <div class="min-h-10">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

/**
 * Command wrapper with title and slot for commands
 */
@Component
export default class CommandsWrapper extends Vue {
  @Prop()
  title: string
}
</script>
