<template>
  <div class="items-center hidden space-x-4 md:flex">
    <h5
      class="block font-semibold tracking-wider uppercase text-md whitespace-nowrap text-vanilla-400"
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

import { ZDivider } from '@deepsource/zeal'

@Component({
  components: {
    ZDivider
  }
})
export default class SectionHeader extends Vue {
  @Prop({ required: true })
  title: string
}
</script>
