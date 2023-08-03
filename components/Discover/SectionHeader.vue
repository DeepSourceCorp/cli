<template>
  <div class="hidden items-center space-x-4 md:flex">
    <h5
      class="text-md block whitespace-nowrap font-semibold uppercase tracking-wider text-vanilla-400"
    >
      {{ title }}
    </h5>
    <div class="flex-grow">
      <z-divider color="ink-200" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'nuxt-property-decorator'

@Component({})
export default class SectionHeader extends Vue {
  @Prop({ required: true })
  title: string
}
</script>
