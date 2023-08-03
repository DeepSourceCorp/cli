<template>
  <div class="space-x-6 sm:flex">
    <slot>
      <!-- Found -->
      <div class="flex items-center space-x-2">
        <z-icon icon="clock" size="small" color="vanilla-400" />
        <span class="text-sm text-vanilla-400">{{ actionText }} {{ createdString }}</span>
      </div>
      <!-- Issue type -->
      <div class="hidden items-center space-x-2 md:flex">
        <z-icon icon="git-commit" size="small" color="vanilla-400" />
        <span class="text-sm text-vanilla-400">{{ compareHash }}</span>
      </div>
      <!-- Created -->
      <div class="hidden items-center space-x-2 md:flex">
        <z-icon icon="timer-reset" size="small" color="vanilla-400" />
        <span class="text-sm text-vanilla-400"
          >{{ finishedInLabel }} <span v-if="showFinishedInTime"> {{ finishedString }}</span>
        </span>
      </div>
    </slot>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { formatSeconds, fromNow } from '@/utils/date'

@Component({})
export default class GistCardTitle extends Vue {
  @Prop({ default: '' })
  createdAt: string

  @Prop({ default: '' })
  finishedIn: number

  @Prop({ default: '' })
  compareHash: string

  @Prop({ default: 'Found' })
  actionText: string

  @Prop({ default: 'Finished in' })
  finishedInLabel: string

  @Prop({ default: true })
  showFinishedInTime: boolean

  get createdString(): string {
    return fromNow(this.createdAt)
  }

  get finishedString(): string {
    return formatSeconds(this.finishedIn)
  }
}
</script>
