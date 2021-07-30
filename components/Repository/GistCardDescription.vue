<template>
  <div class="space-x-6 sm:flex">
    <slot>
      <!-- Found -->
      <div class="flex items-center space-x-2">
        <z-icon icon="clock" size="small" color="vanilla-400"></z-icon>
        <span class="text-xs sm:text-sm text-vanilla-400"
          >{{ actionText }} {{ createdString }}</span
        >
      </div>
      <!-- Issue type -->
      <div class="items-center hidden space-x-2 md:flex">
        <z-icon icon="git-commit" size="small" color="vanilla-400"></z-icon>
        <span class="text-xs sm:text-sm text-vanilla-400">{{ compareHash }}</span>
      </div>
      <!-- Created -->
      <div class="items-center hidden space-x-2 md:flex">
        <z-icon icon="clock" size="small" color="vanilla-400"></z-icon>
        <span class="text-sm sm:text-sm text-vanilla-400"
          >{{ finishedInLabel }} {{ finishedString }}</span
        >
      </div>
    </slot>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { ZIcon } from '@deepsourcelabs/zeal'
import { formatSeconds, fromNow } from '@/utils/date'

@Component({
  components: {
    ZIcon
  }
})
export default class GistCardTitle extends Vue {
  @Prop({ default: '' })
  createdAt!: string

  @Prop({ default: '' })
  finishedIn!: number

  @Prop({ default: '' })
  compareHash!: string

  @Prop({ default: 'Found' })
  actionText!: string

  @Prop({ default: 'Finished in' })
  finishedInLabel!: string

  get createdString(): string {
    return fromNow(this.createdAt)
  }

  get finishedString(): string {
    return formatSeconds(this.finishedIn)
  }
}
</script>
